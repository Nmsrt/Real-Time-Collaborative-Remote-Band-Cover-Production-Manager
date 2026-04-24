import express from 'express';
import cors from 'cors';
import { db, getProjects, hydrateProject, createProject, upsertProject, deleteProject, deleteProjectItem } from './db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const tableMap = {
  members: 'members',
  references: 'references_tracks',
  roles: 'roles',
  stemLinks: 'stem_links',
  videoLinks: 'video_links',
  latestMixes: 'latest_mixes',
  sections: 'sections',
  feedback: 'feedback'
};

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/projects', (_req, res) => res.json(getProjects()));
app.get('/api/projects/:id', (req, res) => {
  const row = db.prepare('SELECT id, title, artist, bpm, song_key as key, difficulty, drive_url as driveUrl FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Project not found' });
  res.json(hydrateProject(row));
});
app.post('/api/projects', (req, res) => res.status(201).json(createProject(req.body)));
app.put('/api/projects/:id', (req, res) => {
  if (req.params.id !== req.body.id) return res.status(400).json({ error: 'Project id mismatch' });
  res.json(upsertProject(req.body));
});
app.delete('/api/projects/:id', (req, res) => {
  const deleted = deleteProject(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Project not found' });
  res.status(204).end();
});
app.delete('/api/projects/:projectId/:collection/:itemId', (req, res) => {
  const table = tableMap[req.params.collection];
  if (!table) return res.status(400).json({ error: 'Invalid collection' });
  const deleted = deleteProjectItem(table, req.params.projectId, req.params.itemId);
  if (!deleted) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`CoverFlow API running on http://localhost:${port}`));
