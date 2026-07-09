import express from 'express';
import cors from 'cors';
import {
  getProjects,
  getProject,
  createProject,
  upsertProject,
  deleteProject,
  deleteProjectItem,
  COLLECTION_TABLES
} from './db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

/**
 * Wrap a route handler so any thrown error becomes a JSON 500 response instead
 * of crashing the request or leaking an HTML stack trace.
 * @param {(req: import('express').Request, res: import('express').Response) => void} fn
 */
function handle(fn) {
  return (req, res) => {
    try {
      fn(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  };
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get(
  '/api/projects',
  handle((_req, res) => res.json(getProjects()))
);

app.get(
  '/api/projects/:id',
  handle((req, res) => {
    const project = getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  })
);

app.post(
  '/api/projects',
  handle((req, res) => {
    if (!req.body || !req.body.title) {
      return res.status(400).json({ error: 'A project title is required' });
    }
    res.status(201).json(createProject(req.body));
  })
);

app.put(
  '/api/projects/:id',
  handle((req, res) => {
    if (req.params.id !== req.body.id) {
      return res.status(400).json({ error: 'Project id mismatch' });
    }
    res.json(upsertProject(req.body));
  })
);

app.delete(
  '/api/projects/:id',
  handle((req, res) => {
    const deleted = deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.status(204).end();
  })
);

app.delete(
  '/api/projects/:projectId/:collection/:itemId',
  handle((req, res) => {
    const table = COLLECTION_TABLES[req.params.collection];
    if (!table) return res.status(400).json({ error: 'Invalid collection' });
    const deleted = deleteProjectItem(table, req.params.projectId, req.params.itemId);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  })
);

// JSON 404 for any unmatched route.
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`CoverFlow API running on http://localhost:${port}`));
