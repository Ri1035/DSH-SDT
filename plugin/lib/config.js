/**
 * dsh-sdt — config layer.
 *
 * 用户配置只放在 `$DSH_HOME/sdt/sdt.config.json`，插件永远不写 profile 的
 * cordis.patch.yml（那是用户与其他插件的文件）。
 *
 * 原则：
 *  - 文件不存在 → 全默认，不报错；
 *  - JSON 语法错 → 抛出带「第 N 行第 M 列」的人话错误；
 *  - 单字段非法 → 只丢弃该字段并记 warning，不拖垮整体。
 */
import fs from 'node:fs';
import path from 'node:path';

export const CONFIG_DIR_NAME = 'sdt';
export const CONFIG_FILE_NAME = 'sdt.config.json';

export const DEFAULT_CONFIG = Object.freeze({
  version: 1,
  colors: {
    brand: '#37a3d6',
    accent: '#1f6fa8',
    bgLight: '#eef6fb',
    bgDark: '#0a1626',
    inkLight: '#0f1b26',
    inkDark: '#dbeaf5',
  },
  tokens: {},
  appearance: {
    mode: 'auto',
  },
  motion: {
    splash: { enabled: true, duration: 2200, skippable: true, oncePerSession: true },
    ambience: { enabled: true, intensity: 0.4 },
  },
  assets: {
    logo: 'logo.svg',
    texture: null,
  },
});

const HEX = /^#[0-9a-f]{6}$/i;

export class ConfigError extends Error {
  constructor(message, file, line, column) {
    super(message);
    this.name = 'ConfigError';
    this.file = file;
    this.line = line;
    this.column = column;
  }

  /** 人类可读的一行报错。 */
  describe() {
    const where =
      this.line === undefined ? this.file : `${this.file}:${this.line}:${this.column ?? 1}`;
    return `${where} — ${this.message}`;
  }
}

/** 从 JSON.parse 的报错里还原行列号（Node V8 通常已带 position）。 */
export function locateJsonError(text, error) {
  const message = String(error && error.message);
  const explicit = /line (\d+) column (\d+)/i.exec(message);
  if (explicit) return { line: Number(explicit[1]), column: Number(explicit[2]) };

  const position = /position (\d+)/i.exec(message);
  if (!position) return { line: undefined, column: undefined };

  const offset = Math.min(Number(position[1]), text.length);
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset; i += 1) {
    if (text[i] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 深合并：用户值优先，数组整体替换。 */
export function mergeConfig(base, patch) {
  if (!isPlainObject(patch)) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) && isPlainObject(out[key]) ? mergeConfig(out[key], value) : value;
  }
  return out;
}

function checkTokens(tokens, warn) {
  if (!isPlainObject(tokens)) {
    warn('tokens', '必须是对象，形如 { "--dsw-alias-brand-primary": { "light": "#...", "dark": "#..." } }');
    return {};
  }
  const accepted = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (!/^--[a-z0-9-]+$/i.test(name)) {
      warn(`tokens.${name}`, '不是合法 CSS 变量名（需以 -- 开头）');
      continue;
    }
    const safe = (v) => typeof v === 'string' && v.length > 0 && v.length <= 120 && !/[;{}<>]|url\(/i.test(v);
    if (isPlainObject(value) && safe(value.light) && safe(value.dark)) {
      accepted[name] = { light: value.light, dark: value.dark };
      continue;
    }
    if (safe(value)) {
      accepted[name] = { light: value, dark: value };
      continue;
    }
    warn(`tokens.${name}`, '需为 { light, dark } 或单个颜色字符串');
  }
  return accepted;
}

/** 校验 + 收敛成可用配置；非法字段只丢弃并记 warning。 */
export function validateConfig(raw) {
  const warnings = [];
  const warn = (field, why) => warnings.push(`${field}: ${why}`);

  const colors = { ...DEFAULT_CONFIG.colors };
  if (isPlainObject(raw.colors)) {
    for (const key of Object.keys(DEFAULT_CONFIG.colors)) {
      const value = raw.colors[key];
      if (value === undefined) continue;
      if (typeof value === 'string' && HEX.test(value)) colors[key] = value;
      else warn(`colors.${key}`, '需为 #rrggbb 形式的颜色');
    }
  } else if (raw.colors !== undefined) {
    warn('colors', '必须是对象');
  }

  const splash = { ...DEFAULT_CONFIG.motion.splash };
  const ambience = { ...DEFAULT_CONFIG.motion.ambience };
  if (isPlainObject(raw.motion)) {
    if (isPlainObject(raw.motion.splash)) {
      const s = raw.motion.splash;
      if (typeof s.enabled === 'boolean') splash.enabled = s.enabled;
      if (Number.isInteger(s.duration) && s.duration >= 400 && s.duration <= 8000) splash.duration = s.duration;
      else if (s.duration !== undefined) warn('motion.splash.duration', '需为 400–8000 的整数（毫秒）');
      if (typeof s.skippable === 'boolean') splash.skippable = s.skippable;
      if (typeof s.oncePerSession === 'boolean') splash.oncePerSession = s.oncePerSession;
    }
    if (isPlainObject(raw.motion.ambience)) {
      const a = raw.motion.ambience;
      if (typeof a.enabled === 'boolean') ambience.enabled = a.enabled;
      if (typeof a.intensity === 'number' && a.intensity >= 0 && a.intensity <= 1) ambience.intensity = a.intensity;
      else if (a.intensity !== undefined) warn('motion.ambience.intensity', '需为 0–1 的数字');
    }
  } else if (raw.motion !== undefined) {
    warn('motion', '必须是对象');
  }

  const appearance = { ...DEFAULT_CONFIG.appearance };
  if (isPlainObject(raw.appearance)) {
    const mode = raw.appearance.mode;
    if (mode === 'auto' || mode === 'light' || mode === 'dark') appearance.mode = mode;
    else if (mode !== undefined) warn('appearance.mode', "需为 'auto' | 'light' | 'dark'");
  }

  const assets = { ...DEFAULT_CONFIG.assets };
  if (isPlainObject(raw.assets)) {
    for (const key of ['logo', 'texture']) {
      const value = raw.assets[key];
      if (value === null) assets[key] = null;
      else if (typeof value === 'string' && !value.includes('..') && !path.isAbsolute(value)) assets[key] = value;
      else if (value !== undefined) warn(`assets.${key}`, '需为包内相对文件名，且不得含 ..');
    }
  }

  return {
    config: {
      version: Number.isInteger(raw.version) ? raw.version : DEFAULT_CONFIG.version,
      colors,
      tokens: checkTokens(raw.tokens, warn),
      appearance,
      motion: { splash, ambience },
      assets,
    },
    warnings,
  };
}

/**
 * 读取并合并配置。
 * @returns {{ config: object, warnings: string[], file: string, exists: boolean }}
 */
export function loadConfig(dshHome) {
  const file = path.join(dshHome, CONFIG_DIR_NAME, CONFIG_FILE_NAME);
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { config: validateConfig(DEFAULT_CONFIG).config, warnings: [], file, exists: false };
    }
    throw new ConfigError(`读取失败：${error.message}`, file, undefined, undefined);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    const { line, column } = locateJsonError(text, error);
    throw new ConfigError(`JSON 语法错误：${error.message}`, file, line, column);
  }

  const merged = mergeConfig(DEFAULT_CONFIG, parsed);
  const { config, warnings } = validateConfig(merged);
  return { config, warnings, file, exists: true };
}

/** 按 mtime 缓存，避免每次请求都读盘。 */
export function createConfigStore(dshHome) {
  let cached = null;
  let stamp = null;
  const file = path.join(dshHome, CONFIG_DIR_NAME, CONFIG_FILE_NAME);

  return function read() {
    let mtime = 0;
    try {
      mtime = fs.statSync(file).mtimeMs;
    } catch {
      mtime = 0;
    }
    if (cached && stamp === mtime) return cached;
    try {
      cached = { ok: true, ...loadConfig(dshHome) };
    } catch (error) {
      cached = {
        ok: false,
        config: validateConfig(DEFAULT_CONFIG).config,
        warnings: [],
        file,
        exists: true,
        error: error instanceof ConfigError ? error.describe() : String(error),
      };
    }
    stamp = mtime;
    return cached;
  };
}