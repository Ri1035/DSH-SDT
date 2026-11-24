/**
 * dsh-sdt — skin packs (MVP).
 *
 * 皮肤目录：`$DSH_HOME/sdt/skins/*.json`，每个文件就是一份「局部 sdt.config.json」。
 * 选择方式：主配置 `appearance.skin = "<文件名不含 .json>"`。
 * 约束：只接受对象；非法 JSON / 不存在 / 名字不合法 → 记 warning 并回退主配置。
 */
import fs from 'node:fs';
import path from 'node:path';

const MAX_SKIN_BYTES = 256 * 1024;

export function skinsDir(dshHome) {
  return path.join(dshHome, 'sdt', 'skins');
}

/** 皮肤 id 只允许安全文件名（无路径、无 ..、<=64）。 */
export function isSafeSkinId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= 64 &&
    !id.includes('..') && !id.includes('/') && !id.includes('\\');
}

function readJsonFile(file) {
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size === 0 || stat.size > MAX_SKIN_BYTES) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * 读取一个皮肤。
 * @returns {{ ok: true, id: string, name: string, data: object } | { ok: false, reason: string }}
 */
export function readSkin(dshHome, id) {
  if (!isSafeSkinId(id)) return { ok: false, reason: '皮肤名不合法' };
  const file = path.join(skinsDir(dshHome), `${id}.json`);
  try {
    const data = readJsonFile(file);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, reason: '皮肤文件必须是 JSON 对象' };
    }
    const name = typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 40) : id;
    return { ok: true, id, name, data };
  } catch (error) {
    if (error && error.code === 'ENOENT') return { ok: false, reason: '皮肤文件不存在' };
    return { ok: false, reason: `皮肤解析失败：${error.message}` };
  }
}

/** 列出全部皮肤（供控制台/设置页展示；坏文件也列出来并带 error）。 */
export function listSkins(dshHome) {
  const dir = skinsDir(dshHome);
  let names = [];
  try {
    names = fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort();
  } catch {
    return [];
  }
  return names.map((file) => {
    const id = file.slice(0, -5);
    const hit = readSkin(dshHome, id);
    if (!hit.ok) return { id, name: id, ok: false, error: hit.reason };
    return {
      id,
      name: hit.name,
      ok: true,
      colors: hit.data.colors || null,
      appearance: hit.data.appearance || null,
    };
  });
}
