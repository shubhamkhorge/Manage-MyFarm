import { SERVER_URL } from '../config';
import { all, getMeta, queueUpsert, setMeta, upsert, getDb } from '../storage/db';
import { uuid } from '../utils/uuid';

const tables = ['plots','crops','workers','attendance','irrigation','sprays','notes'] as const;

export async function getUserId() {
  let id = await getMeta('user_id');
  if (!id) {
    id = uuid();
    await setMeta('user_id', id);
  }
  return id;
}

export async function syncNow(): Promise<{ ok: boolean; pulled?: any }>{
  const userId = await getUserId();
  const since = await getMeta('last_sync_at');
  const outbox = await all<{ id: string; table_name: string; row_json: string; deleted_id: string | null }>(`SELECT * FROM outbox ORDER BY created_at ASC`);

  const grouped: Record<string, { rows: any[]; deletes: string[] }> = {};
  for (const t of tables) grouped[t] = { rows: [], deletes: [] };
  for (const ob of outbox) {
    if (ob.row_json) grouped[ob.table_name].rows.push(JSON.parse(ob.row_json));
    if (ob.deleted_id) grouped[ob.table_name].deletes.push(ob.deleted_id);
  }

  const changes = Object.entries(grouped)
    .filter(([, v]) => v.rows.length || v.deletes.length)
    .map(([table, v]) => ({ table, rows: v.rows, deletes: v.deletes }));

  const body = { userId, since: since || undefined, changes };

  const res = await fetch(`${SERVER_URL}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('sync_failed');
  const data = await res.json();

  // Apply pulled rows into local DB
  for (const table of tables) {
    const rows = data.pulled?.[table] || [];
    for (const row of rows) {
      // Map server rows to local columns (drop user_id)
      const { user_id, ...local } = row;
      await upsert(table, local);
    }
  }

  // Clear outbox on successful push
  const d = await getDb();
  // @ts-ignore
  if (d.runAsync) await d.runAsync('DELETE FROM outbox');
  else await new Promise((resolve, reject) => d.transaction(tx => {
    tx.executeSql('DELETE FROM outbox', [], () => resolve(true), (_, e) => { reject(e); return false; });
  }));

  // Save last sync time
  await setMeta('last_sync_at', data.serverTime || new Date().toISOString());
  return { ok: true, pulled: data.pulled };
}

export async function createPlot(name: string, area?: number) {
  const row = { id: uuid(), name, area: area || null, crop_id: null, updated_at: new Date().toISOString() };
  await upsert('plots', row);
  await queueUpsert('plots', row);
}

export async function createWorker(name: string, wage_type: 'daily'|'hourly'|'piece' = 'daily', rate = 0) {
  const row = { id: uuid(), name, wage_type, rate, updated_at: new Date().toISOString() };
  await upsert('workers', row);
  await queueUpsert('workers', row);
}

export async function markAttendance(worker_id: string, dateISO: string, plot_id: string | null, task_type: string, hours?: number, pieces?: number) {
  const row = { id: uuid(), worker_id, date: dateISO, plot_id, task_type, hours: hours || null, pieces: pieces || null, updated_at: new Date().toISOString() };
  await upsert('attendance', row);
  await queueUpsert('attendance', row);
}

export async function createIrrigationLog(plot_id: string, durationMin: number, schedule: string = 'manual', start?: Date, end?: Date) {
  const now = new Date();
  const actualStart = start || now;
  const actualEnd = end || new Date(actualStart.getTime() + Math.max(0, Math.round(durationMin)) * 60000);
  const row = {
    id: uuid(),
    plot_id,
    schedule,
    duration: Math.round(durationMin),
    actual_start: actualStart.toISOString(),
    actual_end: actualEnd.toISOString(),
    updated_at: new Date().toISOString()
  };
  await upsert('irrigation', row);
  await queueUpsert('irrigation', row);
}

export async function createSprayLog(
  plot_id: string,
  product: string,
  target_pest?: string,
  dosage?: number,
  water_l?: number,
  operator?: string,
  options?: { wind?: number | null; temp?: number | null; phi_date?: string | null; rei_until?: string | null }
) {
  const row = {
    id: uuid(),
    plot_id,
    product,
    target_pest: target_pest || null,
    dosage: typeof dosage === 'number' ? dosage : null,
    water_l: typeof water_l === 'number' ? water_l : null,
    operator: operator || null,
    wind: options?.wind ?? null,
    temp: options?.temp ?? null,
    phi_date: options?.phi_date ?? null,
    rei_until: options?.rei_until ?? null,
    photos: null,
    updated_at: new Date().toISOString()
  } as any;
  await upsert('sprays', row);
  await queueUpsert('sprays', row);
}

export async function createNote(plot_id: string | null, text: string, tags?: string, photos?: string | null, audio?: string | null) {
  const row = {
    id: uuid(),
    plot_id: plot_id || null,
    text,
    tags: tags || null,
    photos: photos ?? null,
    audio: audio ?? null,
    updated_at: new Date().toISOString()
  };
  await upsert('notes', row);
  await queueUpsert('notes', row);
}

