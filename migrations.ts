export const migrations = [
  `CREATE TABLE IF NOT EXISTS commands (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     prompt TEXT NOT NULL,
     position INTEGER NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS commands_name_unique
     ON commands (lower(name))`,
  `ALTER TABLE commands ADD COLUMN use_count INTEGER NOT NULL DEFAULT 0`,
  `CREATE TABLE IF NOT EXISTS collections (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     position INTEGER NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS collections_name_unique
     ON collections (lower(name))`,
  `CREATE TABLE IF NOT EXISTS collection_projects (
     collection_id TEXT NOT NULL,
     project_id TEXT NOT NULL UNIQUE,
     position INTEGER NOT NULL,
     PRIMARY KEY (collection_id, project_id),
     FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
   )`,
  `CREATE INDEX IF NOT EXISTS collection_projects_order
     ON collection_projects (collection_id, position)`,
  `CREATE TABLE IF NOT EXISTS todos (
     thread_id TEXT PRIMARY KEY,
     items TEXT NOT NULL,
     updated_at INTEGER NOT NULL
   )`,
];
