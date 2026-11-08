// Powvy 记忆: answers the panel with Claude Mem data (read-only HTTP API of the local worker) and the Obsidian 关于我 notes.
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import * as M from './mem.mjs';
import { aboutMe } from './obsidian.mjs';

export default function activate(orca) {
  orca.panels.handle('status', () => M.status());
  orca.panels.handle('project', async (input) => {
    const name = basename(String(input?.path || '')).replace(/[^\w.\-\u4e00-\u9fff]/g, '') || ''; // workspace name = Claude Mem project name
    const mem = await M.project(name).catch((e) => ({ error: e.message }));
    // Sessions started from ~ are filed under another project name: fall back to a keyword search.
    const related = !mem.error && !mem.observations?.items.length && name ? await M.search(name).catch(() => null) : null;
    return { name, mem, related };
  });
  orca.panels.handle('search', (input) => M.search(String(input?.query || ''), input?.project || undefined));
  orca.panels.handle('me', () => aboutMe(join(homedir(), '.powvy-code')));
}
