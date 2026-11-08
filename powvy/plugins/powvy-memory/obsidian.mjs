// Reads the "关于我" (about me) folder of your Obsidian vault: the shared profile Claude Code and Codex read and append to.
// The vault comes from ~/.powvy-code/settings.json "vault", else Obsidian's own vault list. Read-only here; edit in Obsidian.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';

export const FOLDER = '关于我';

export function vaultPath(dataDir) {
  try { const v = JSON.parse(readFileSync(join(dataDir, 'settings.json'), 'utf8')).vault; if (v) return v; } catch {}
  try {
    const vaults = Object.values(JSON.parse(readFileSync(join(homedir(), 'Library/Application Support/obsidian/obsidian.json'), 'utf8')).vaults || {});
    vaults.sort((a, b) => (b.open ? 1 : 0) - (a.open ? 1 : 0) || (b.ts || 0) - (a.ts || 0));
    return vaults[0]?.path || null;
  } catch { return null; }
}

export function aboutMe(dataDir) {
  const vault = vaultPath(dataDir);
  if (!vault) return { vault: null, error: '没有找到 Obsidian 仓库（~/Library/Application Support/obsidian/obsidian.json 不可读）' };
  const dir = join(vault, FOLDER);
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.md')); }
  catch (e) { return { vault, vaultName: basename(vault), folder: FOLDER, notes: [], error: e.code === 'ENOENT' ? `仓库里还没有“${FOLDER}”文件夹` : e.message }; }
  const notes = files.map((f) => {
    const p = join(dir, f), st = statSync(p), text = readFileSync(p, 'utf8');
    return { name: f.slice(0, -3), file: `${FOLDER}/${f}`, updated: st.mtimeMs, body: text.length > 40000 ? text.slice(0, 40000) + '\n\n…（太长，已截断，完整内容请在 Obsidian 查看）' : text };
  }).sort((a, b) => (a.name === '索引' ? -1 : b.name === '索引' ? 1 : b.updated - a.updated));
  return { vault: vault.replace(homedir(), '~'), vaultName: basename(vault), folder: FOLDER, notes };
}
