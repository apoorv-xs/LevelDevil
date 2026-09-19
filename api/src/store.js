const tables = ["applications", "inquiries", "invitations", "leads", "assignments", "auditEvents"];
const db = Object.fromEntries(tables.map((name) => [name, new Map()]));
let sequence = 0;
const id = (prefix) => `${prefix}_${Date.now().toString(36)}_${(++sequence).toString(36)}`;
export function resetStore() { for (const table of Object.values(db)) table.clear(); sequence = 0; }
export const repository = (table) => ({
  create(value) { const record = { id: id(table.slice(0, -1)), createdAt: new Date().toISOString(), ...value }; db[table].set(record.id, record); return record; },
  get(key) { return db[table].get(key); },
  list(filter = () => true) { return [...db[table].values()].filter(filter); },
  update(key, patch) { const old = db[table].get(key); if (!old) return undefined; const next = { ...old, ...patch, updatedAt: new Date().toISOString() }; db[table].set(key, next); return next; },
  delete(key) { return db[table].delete(key); },
});
export const repos = Object.fromEntries(tables.map((name) => [name, repository(name)]));
export async function transaction(work) { return work(repos); }
