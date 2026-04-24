import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedProjects } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'coverflow.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  bpm TEXT,
  song_key TEXT,
  difficulty TEXT,
  drive_url TEXT
);
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS references_tracks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  url TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  role TEXT NOT NULL,
  member_id TEXT,
  deadline TEXT,
  status TEXT,
  note TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS stem_links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  role_id TEXT,
  member_id TEXT,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS video_links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  role_id TEXT,
  member_id TEXT,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS latest_mixes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT,
  note TEXT,
  created_at TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  label TEXT NOT NULL,
  difficulty TEXT,
  note TEXT,
  members TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  author TEXT,
  member_id TEXT,
  role TEXT,
  message TEXT NOT NULL,
  created_at TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
`);

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const count = db.prepare('SELECT COUNT(*) as total FROM projects').get().total;
if (count === 0) seedProjects(db);

export function getProjects() {
  const projects = db.prepare('SELECT id, title, artist, bpm, song_key as key, difficulty, drive_url as driveUrl FROM projects ORDER BY rowid DESC').all();
  return projects.map(hydrateProject);
}

export function hydrateProject(project) {
  return {
    ...project,
    members: db.prepare('SELECT id, name, color FROM members WHERE project_id = ?').all(project.id),
    references: db.prepare('SELECT id, title, note, url FROM references_tracks WHERE project_id = ?').all(project.id),
    roles: db.prepare('SELECT id, role, member_id as memberId, deadline, status, note FROM roles WHERE project_id = ?').all(project.id),
    stemLinks: db.prepare('SELECT id, role_id as roleId, member_id as memberId, label, url, status FROM stem_links WHERE project_id = ?').all(project.id),
    videoLinks: db.prepare('SELECT id, role_id as roleId, member_id as memberId, label, url, status FROM video_links WHERE project_id = ?').all(project.id),
    latestMixes: db.prepare('SELECT id, label, url, status, note, created_at as createdAt FROM latest_mixes WHERE project_id = ? ORDER BY rowid ASC').all(project.id),
    sections: db.prepare('SELECT id, label, difficulty, note, members FROM sections WHERE project_id = ? ORDER BY sort_order ASC').all(project.id),
    feedback: db.prepare('SELECT id, author, member_id as memberId, role, message, created_at as createdAt FROM feedback WHERE project_id = ? ORDER BY rowid DESC').all(project.id)
  };
}

export function createProject(data) {
  const id = uid('project');
  db.prepare('INSERT INTO projects (id, title, artist, bpm, song_key, difficulty, drive_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, data.title, data.artist || 'Artist TBD', data.bpm || '---', data.key || '---', data.difficulty || 'Medium', data.driveUrl || '');
  return hydrateProject(db.prepare('SELECT id, title, artist, bpm, song_key as key, difficulty, drive_url as driveUrl FROM projects WHERE id = ?').get(id));
}

export function upsertProject(project) {
  const tx = db.transaction(() => {
    db.prepare('INSERT OR REPLACE INTO projects (id, title, artist, bpm, song_key, difficulty, drive_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(project.id, project.title, project.artist, String(project.bpm), project.key, project.difficulty, project.driveUrl || '');
    for (const table of ['members','references_tracks','roles','stem_links','video_links','latest_mixes','sections','feedback']) db.prepare(`DELETE FROM ${table} WHERE project_id = ?`).run(project.id);
    const insMember = db.prepare('INSERT INTO members VALUES (?, ?, ?, ?)');
    project.members.forEach(m => insMember.run(m.id, project.id, m.name, m.color));
    const insRef = db.prepare('INSERT INTO references_tracks VALUES (?, ?, ?, ?, ?)');
    project.references.forEach(r => insRef.run(r.id, project.id, r.title, r.note || '', r.url || ''));
    const insRole = db.prepare('INSERT INTO roles VALUES (?, ?, ?, ?, ?, ?, ?)');
    project.roles.forEach(r => insRole.run(r.id, project.id, r.role, r.memberId || null, r.deadline || '', r.status || 'Not started', r.note || ''));
    const insStem = db.prepare('INSERT INTO stem_links VALUES (?, ?, ?, ?, ?, ?, ?)');
    project.stemLinks.forEach(l => insStem.run(l.id, project.id, l.roleId || null, l.memberId || null, l.label, l.url, l.status || 'Waiting'));
    const insVideo = db.prepare('INSERT INTO video_links VALUES (?, ?, ?, ?, ?, ?, ?)');
    project.videoLinks.forEach(l => insVideo.run(l.id, project.id, l.roleId || null, l.memberId || null, l.label, l.url, l.status || 'Waiting'));
    const insMix = db.prepare('INSERT INTO latest_mixes VALUES (?, ?, ?, ?, ?, ?, ?)');
    (project.latestMixes || []).forEach(m => insMix.run(m.id, project.id, m.label, m.url, m.status || 'For review', m.note || '', m.createdAt || new Date().toISOString().slice(0, 10)));
    const insSection = db.prepare('INSERT INTO sections VALUES (?, ?, ?, ?, ?, ?, ?)');
    project.sections.forEach((sec, i) => insSection.run(sec.id, project.id, sec.label, sec.difficulty, sec.note || '', sec.members || '', i));
    const insFeedback = db.prepare('INSERT INTO feedback VALUES (?, ?, ?, ?, ?, ?, ?)');
    project.feedback.forEach(f => insFeedback.run(f.id, project.id, f.author || '', f.memberId || null, f.role || '', f.message, f.createdAt || new Date().toLocaleString()));
  });
  tx();
  return hydrateProject(db.prepare('SELECT id, title, artist, bpm, song_key as key, difficulty, drive_url as driveUrl FROM projects WHERE id = ?').get(project.id));
}

export function deleteProject(id) {
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return result.changes > 0;
}

export function deleteProjectItem(table, projectId, itemId) {
  const allowed = new Set(['members', 'references_tracks', 'roles', 'stem_links', 'video_links', 'latest_mixes', 'sections', 'feedback']);
  if (!allowed.has(table)) throw new Error('Invalid table');
  const result = db.prepare(`DELETE FROM ${table} WHERE project_id = ? AND id = ?`).run(projectId, itemId);
  return result.changes > 0;
}
