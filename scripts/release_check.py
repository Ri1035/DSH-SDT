"""DSH-SDT release self-check.

Runs the checks every version bump must pass. Read-only.

Usage:
    python scripts/release_check.py            # in the repo root
Exit code 0 = all checks pass.
"""
from __future__ import annotations

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "node_modules", "tools", "__pycache__"}

CRITICAL_FILES = ["VERSION", "README.md", "CHANGELOG.md", "docs/TODO.md", "AGENTS.md", "HANDOFF.md"]

results: list[tuple[bool, str, str]] = []


def record(ok: bool, name: str, detail: str = "") -> None:
    results.append((ok, name, detail))


def read(rel: str) -> str:
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def walk_markdown() -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.endswith(".md"):
                out.append(os.path.relpath(os.path.join(dirpath, name), ROOT))
    return sorted(out)


def check_version_format() -> None:
    raw = read("VERSION").strip()
    ok = bool(re.fullmatch(r"v[1-9]\d*\.[0-9]", raw))
    record(ok, "VERSION 格式为 vX.Y（Y 仅 0-9）", f"读到 {raw!r}")


def check_client_version() -> None:
    """client.js 的 VERSION 常量必须与 VERSION 文件一致。

    v1.5 曾出现 client.js 仍写 '1.3' 而项目已到 v1.5，导致 __sdtDebug 误报。
    """
    project = read("VERSION").strip().lstrip("v")
    path = os.path.join(ROOT, "plugin", "client.js")
    if not os.path.exists(path):
        record(False, "client.js 版本常量与 VERSION 一致", "plugin/client.js 不存在")
        return
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    found = re.search(r"const VERSION = '([^']+)'", text)
    got = found.group(1) if found else "未找到"
    record(got == project, "client.js 版本常量与 VERSION 一致", f"client.js={got} / VERSION={project}")


def check_changelog_heading() -> None:
    version = read("VERSION").strip()
    text = read("CHANGELOG.md")
    ok = re.search(rf"^##\s+{re.escape(version)}\b", text, re.M) is not None
    record(ok, f"CHANGELOG 含当前版本标题 {version}", "")


def check_forbidden_versions() -> None:
    """Validate *declared* project versions, not prose numbers.

    In scope: the VERSION file, CHANGELOG `## v...` headings, the CHANGELOG
    version-history table, README lines declaring the current version, and a
    package.json `version` once one exists. Tool versions such as Node
    `24.21.0` or DSH `0.2.2-rc.1` legitimately appear as three-segment numbers
    and are not project versions, so prose is deliberately out of scope.
    """
    strict = re.compile(r"v[1-9]\d*\.[0-9]")
    hits: list[str] = []

    for rel in walk_markdown():
        text = read(rel)
        for line_no, line in enumerate(text.splitlines(), 1):
            heading = re.match(r"^#{2,4}\s+(v\S+)", line)
            if heading and not strict.fullmatch(heading.group(1).rstrip(":：,，.")):
                hits.append(f"{rel}:{line_no} 标题 {heading.group(1)}")
            row = re.match(r"^\|\s*\**(v\S+?)\**\s*\|", line)
            if row and not strict.fullmatch(row.group(1).rstrip(":：,，.")):
                hits.append(f"{rel}:{line_no} 表格 {row.group(1)}")
            if "当前版本" in line:
                for token in re.findall(r"\bv\S+", line):
                    clean = token.rstrip("`）),，。:：")
                    if not strict.fullmatch(clean):
                        hits.append(f"{rel}:{line_no} 声明 {clean}")

    pkg = os.path.join(ROOT, "package.json")
    pkg = os.path.join(ROOT, "plugin", "package.json")
    if os.path.exists(pkg):
        with open(pkg, encoding="utf-8") as fh:
            version = re.search(r'"version"\s*:\s*"([^"]+)"', fh.read())
        project = read("VERSION").strip()
        if version:
            # npm/pnpm require a three-segment semver in the manifest; the project
            # version stays two-segment. Map 1.1.0 -> v1.1 and compare.
            manifest = version.group(1)
            mapped = ".".join(manifest.split(".")[:2])
            if mapped != project.lstrip("v"):
                hits.append(f"plugin/package.json {manifest} != VERSION {project}")

    record(not hits, "声明的项目版本一律 vX.Y（无三段 / 两位小数）", "; ".join(hits[:6]))


def check_relative_links() -> None:
    missing = []
    for rel in walk_markdown():
        text = read(rel)
        for label, target in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", text):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            path = target.split("#", 1)[0]
            if not path:
                continue
            resolved = os.path.normpath(os.path.join(ROOT, os.path.dirname(rel), path))
            if not os.path.exists(resolved):
                missing.append(f"{rel} -> {target}")
    record(not missing, "相对链接全部指向存在的文件", "; ".join(missing[:6]))


def check_branding() -> None:
    readme = read("README.md")
    ok = "DSH-SDT" in readme and "Spiritron Dress Tailoring" in readme
    record(ok, "README 含项目名与全称", "（灵衣只作命名出处，不作产品术语，故不强制）")


def check_secrets() -> None:
    patterns = [re.compile(r"ghp_[A-Za-z0-9]{20,}"), re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}")]
    hits = []
    for rel in walk_markdown() + CRITICAL_FILES:
        if not os.path.exists(os.path.join(ROOT, rel)):
            continue
        try:
            text = read(rel)
        except UnicodeDecodeError:
            continue
        for pat in patterns:
            if pat.search(text):
                hits.append(rel)
    record(not hits, "仓库文本无 token 字面量", ", ".join(sorted(set(hits))))


def check_docs_present() -> None:
    missing = [p for p in CRITICAL_FILES if not os.path.exists(os.path.join(ROOT, p))]
    record(not missing, "关键文档齐全", ", ".join(missing))


def main() -> int:
    for fn in (
        check_version_format,
        check_changelog_heading,
        check_client_version,
        check_forbidden_versions,
        check_relative_links,
        check_branding,
        check_secrets,
        check_docs_present,
    ):
        try:
            fn()
        except Exception as exc:  # a crashing check is a failing check
            record(False, fn.__name__, f"异常: {exc}")

    width = max(len(n) for _, n, _ in results)
    for ok, name, detail in results:
        mark = "PASS" if ok else "FAIL"
        print(f"[{mark}] {name.ljust(width)}  {detail}")
    failed = [r for r in results if not r[0]]
    print(f"\n{len(results) - len(failed)}/{len(results)} 通过")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())