/**
 * dsh-sdt — asset resolver.
 *
 * 目录：`$DSH_HOME/sdt/assets/`（用户素材）→ 包内 `assets/`（内置回退）。
 * 安全：白名单扩展名、禁止路径穿越、体积上限、只读不写。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = path.resolve(HERE, '..');
export const BUILTIN_ASSET_DIR = path.join(PACKAGE_ROOT, 'assets');

/** 允许对外提供的扩展名 → content-type。 */
export const CONTENT_TYPES = Object.freeze({
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
});

export const MAX_ASSET_BYTES = 4 * 1024 * 1024;

export function contentType(name) {
  return CONTENT_TYPES[path.extname(name).toLowerCase()] ?? null;
}

/**
 * 规范化请求名：拒绝穿越、绝对路径、空字节、隐藏文件。
 * @returns {string|null} 干净的相对路径，或 null 表示拒绝
 */
export function sanitizeName(name) {
  if (!name || typeof name !== 'string') return null;
  let decoded;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  if (decoded.includes('..')) return null;
  if (decoded.startsWith('/') || decoded.startsWith('\\')) return null;
  if (path.isAbsolute(decoded)) return null;
  const segments = decoded.split(/[\\/]+/).filter(Boolean);
  if (segments.length === 0 || segments.some((s) => s.startsWith('.'))) return null;
  if (segments.length > 4) return null;
  return segments.join('/');
}

function within(dir, target) {
  const rel = path.relative(dir, target);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function readCandidate(dir, name) {
  const target = path.resolve(dir, name);
  if (!within(dir, target)) return null;
  let stat;
  let real;
  let realDir;
  try {
    // 解析符号链接后再校验一次：防止 assets 目录里的链接指向目录外
    realDir = fs.realpathSync(dir);
    real = fs.realpathSync(target);
    stat = fs.statSync(real);
  } catch {
    return null;
  }
  if (!within(realDir, real)) return null;
  if (!stat.isFile() || stat.size === 0 || stat.size > MAX_ASSET_BYTES) return null;
  return { path: real, size: stat.size };
}

/**
 * 解析一个素材：用户目录优先，其次内置。
 * @returns {{ body: Buffer, type: string, source: 'user'|'builtin' }|null}
 */
export function resolveAsset(name, userDir) {
  const clean = sanitizeName(name);
  if (!clean) return null;
  const type = contentType(clean);
  if (!type) return null;

  const candidates = [];
  if (userDir) candidates.push({ dir: userDir, source: 'user' });
  candidates.push({ dir: BUILTIN_ASSET_DIR, source: 'builtin' });

  for (const candidate of candidates) {
    const hit = readCandidate(candidate.dir, clean);
    if (!hit) continue;
    try {
      return { body: fs.readFileSync(hit.path), type, source: candidate.source };
    } catch {
      continue;
    }
  }
  return null;
}

/** 素材目录（用户层），可能在库加载时还不存在，按需创建。 */
export function ensureUserAssetDir(dshHome) {
  const dir = path.join(dshHome, 'sdt', 'assets');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // 无权限时静默降级到内置素材
  }
  return dir;
}