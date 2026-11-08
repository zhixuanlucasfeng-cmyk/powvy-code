// Read-only client for the Claude Mem worker's localhost HTTP API (the same API its own viewer uses).
// Only GET endpoints are called, and only curated fields leave this module — never the raw database.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export function memBase() {
  if (process.env.POWVY_MEM_URL) return process.env.POWVY_MEM_URL.replace(/\/$/, '');
  const dir = process.env.CLAUDE_MEM_DIR || join(homedir(), '.claude-mem');
  try { const { port } = JSON.parse(readFileSync(join(dir, 'worker.pid'), 'utf8')); if (Number.isInteger(port)) return `http://127.0.0.1:${port}`; } catch {}
  return null;
}

async function get(path, params = {}) {
  const base = memBase();
  if (!base) throw new Error('找不到 Claude Mem worker 的端口（~/.claude-mem/worker.pid 不可读）');
  const u = new URL(base + path);
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '') u.searchParams.set(k, String(v));
  const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`Claude Mem 返回 ${r.status}（${path}）`);
  return r.json();
}

const arr = (v) => { if (Array.isArray(v)) return v; try { const x = JSON.parse(v || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } };
const obs = (o) => ({
  id: o.id, type: o.type, title: o.title || '', subtitle: o.subtitle || '', narrative: o.narrative || '',
  facts: arr(o.facts).map(String).slice(0, 12), filesRead: arr(o.files_read).slice(0, 12), filesModified: arr(o.files_modified).slice(0, 12),
  project: o.project, session: o.content_session_id || null, at: o.created_at || null, model: o.generated_by_model || null,
});
const sum = (s) => ({ id: s.id, session: s.session_id || null, request: s.request || '', investigated: s.investigated || '', learned: s.learned || '', completed: s.completed || '', next: s.next_steps || '', at: s.created_at || null, project: s.project });
const prompt = (p) => ({ id: p.id, session: p.content_session_id || null, text: String(p.prompt_text || '').slice(0, 1200), at: p.created_at || null, project: p.project });

export async function status() {
  const base = memBase();
  if (!base) return { connected: false, error: '找不到 Claude Mem worker 端口' };
  try {
    const h = await get('/api/health');
    const s = await get('/api/stats').catch(() => null);
    const p = await get('/api/projects').catch(() => ({ projects: [] }));
    return { connected: h.status === 'ok', version: h.version || null, viewer: base + '/', projects: p.projects || [],
      counts: s?.database ? { observations: s.database.observations, summaries: s.database.summaries, sessions: s.database.sessions } : null };
  } catch (e) { return { connected: false, viewer: base + '/', error: e.message }; }
}

export async function project(name) {
  const [o, s, p] = await Promise.allSettled([
    get('/api/observations', { project: name, limit: 40 }),
    get('/api/summaries', { project: name, limit: 12 }),
    get('/api/prompts', { project: name, limit: 12 }),
  ]);
  const pick = (r, map) => (r.status === 'fulfilled' ? { items: (r.value.items || []).filter((x) => x.project === name || x.merged_into_project === name).map(map), more: !!r.value.hasMore } : { items: [], error: r.reason.message });
  return { observations: pick(o, obs), summaries: pick(s, sum), prompts: pick(p, prompt) };
}

export async function search(query, projectName) {
  const r = await get('/api/search', { query, project: projectName, format: 'json', limit: 20 });
  return { observations: (r.observations || []).map(obs), summaries: (r.sessions || []).map(sum), prompts: (r.prompts || []).map(prompt), total: r.totalResults ?? null };
}

export async function observation(id) {
  if (!/^\d+$/.test(String(id))) throw new Error('无效的记忆编号');
  return obs(await get('/api/observation/' + id));
}
