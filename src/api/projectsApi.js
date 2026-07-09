/**
 * Client for the CoverFlow Supabase project. Talks to Postgres directly via
 * the anon key (see ./supabaseClient) — there is no backend server. All
 * mutations go through Postgres functions (see sql/schema.sql) rather than
 * direct table access, so there is one choke point for future auth checks
 * instead of several.
 * @typedef {import('../types').Project} Project
 */
import { supabase } from './supabaseClient';

/**
 * Maps an API/JSON collection name to its backing Postgres table. Shared
 * source of truth for the `delete_project_item` RPC's table_name argument
 * and the `upsert_project` RPC's payload keys (see sql/schema.sql).
 */
export const COLLECTION_TABLES = {
  members: 'members',
  references: 'references_tracks',
  roles: 'roles',
  stemLinks: 'stem_links',
  videoLinks: 'video_links',
  latestMixes: 'latest_mixes',
  sections: 'sections',
  feedback: 'feedback'
};

// Embedded (nested) select across every child table in one round trip.
const PROJECT_SELECT = `
  id, title, artist, bpm, song_key, difficulty, drive_url,
  members ( id, name, color ),
  references_tracks ( id, title, note, url ),
  roles ( id, role, member_id, deadline, status, note ),
  stem_links ( id, role_id, member_id, label, url, status ),
  video_links ( id, role_id, member_id, label, url, status ),
  latest_mixes ( id, label, url, status, note, created_at ),
  sections ( id, label, difficulty, note, members, sort_order ),
  feedback ( id, author, member_id, role, message, created_at )
`;

/** Base query builder for a fully hydrated project, ordering embedded collections. */
function projectQuery() {
  return supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('seq', { foreignTable: 'stem_links', ascending: false })
    .order('seq', { foreignTable: 'video_links', ascending: false })
    .order('seq', { foreignTable: 'latest_mixes', ascending: false })
    .order('seq', { foreignTable: 'feedback', ascending: false })
    .order('sort_order', { foreignTable: 'sections', ascending: true });
}

/** Convert a Supabase row (snake_case, nested by table name) to the shape the UI uses. */
function mapProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    bpm: row.bpm,
    key: row.song_key,
    difficulty: row.difficulty,
    driveUrl: row.drive_url,
    members: (row.members || []).map((m) => ({ id: m.id, name: m.name, color: m.color })),
    references: (row.references_tracks || []).map((r) => ({
      id: r.id,
      title: r.title,
      note: r.note,
      url: r.url
    })),
    roles: (row.roles || []).map((r) => ({
      id: r.id,
      role: r.role,
      memberId: r.member_id,
      deadline: r.deadline,
      status: r.status,
      note: r.note
    })),
    stemLinks: (row.stem_links || []).map((l) => ({
      id: l.id,
      roleId: l.role_id,
      memberId: l.member_id,
      label: l.label,
      url: l.url,
      status: l.status
    })),
    videoLinks: (row.video_links || []).map((l) => ({
      id: l.id,
      roleId: l.role_id,
      memberId: l.member_id,
      label: l.label,
      url: l.url,
      status: l.status
    })),
    latestMixes: (row.latest_mixes || []).map((m) => ({
      id: m.id,
      label: m.label,
      url: m.url,
      status: m.status,
      note: m.note,
      createdAt: m.created_at
    })),
    sections: (row.sections || []).map((s) => ({
      id: s.id,
      label: s.label,
      difficulty: s.difficulty,
      note: s.note,
      members: s.members
    })),
    feedback: (row.feedback || []).map((f) => ({
      id: f.id,
      author: f.author,
      memberId: f.member_id,
      role: f.role,
      message: f.message,
      createdAt: f.created_at
    }))
  };
}

/**
 * Fetch every project, fully hydrated with its child collections.
 * @returns {Promise<Project[]>}
 */
export async function fetchProjects() {
  const { data, error } = await projectQuery().order('seq', { ascending: false });
  if (error) throw error;
  return data.map(mapProject);
}

/**
 * Create a new project from its core details, via the `create_project`
 * Postgres function, which generates the id server-side and returns the
 * fresh (empty-children) project directly — no separate re-select needed.
 * @param {Partial<Project>} projectData
 * @returns {Promise<Project>}
 */
export async function createProjectApi(projectData) {
  if (!projectData?.title) throw new Error('A project title is required');

  const { data, error } = await supabase.rpc('create_project', {
    payload: {
      title: projectData.title,
      artist: projectData.artist,
      bpm: projectData.bpm,
      key: projectData.key,
      difficulty: projectData.difficulty,
      driveUrl: projectData.driveUrl
    }
  });
  if (error) throw error;
  return mapProject(data);
}

/**
 * Persist the full state of an existing project (replaces child collections)
 * via the `upsert_project` Postgres function, which runs the whole diff
 * (update/insert/delete per child table, dangling-reference sanitization)
 * inside a single database transaction and returns the freshly hydrated
 * project directly — no separate re-select needed.
 * @param {Project} project
 * @returns {Promise<Project>}
 */
export async function saveProjectApi(project) {
  const { data, error } = await supabase.rpc('upsert_project', { payload: project });
  if (error) throw error;
  return mapProject(data);
}

/**
 * Delete a project and all of its related rows (FK ON DELETE CASCADE), via
 * the `delete_project` Postgres function.
 * @param {string} projectId
 * @returns {Promise<null>}
 */
export async function deleteProjectApi(projectId) {
  const { data: deleted, error } = await supabase.rpc('delete_project', { pid: projectId });
  if (error) throw error;
  if (!deleted) throw new Error('Project not found');
  return null;
}

/**
 * Delete a single item from one of a project's child collections, via the
 * `delete_project_item` Postgres function. That function applies the FK ON
 * DELETE CASCADE / SET NULL actions declared in sql/schema.sql server-side
 * (e.g. deleting a role cascades to its stem/video links; deleting a member
 * nulls out memberId on roles/links/feedback) and returns the project
 * re-hydrated with those results, so the caller applies real DB state
 * instead of re-deriving the cascade locally.
 * @param {string} projectId
 * @param {string} collection - API collection name (e.g. `stemLinks`).
 * @param {string} itemId
 * @returns {Promise<Project>}
 */
export async function deleteProjectItemApi(projectId, collection, itemId) {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error('Invalid collection');

  const { data, error } = await supabase.rpc('delete_project_item', {
    table_name: table,
    pid: projectId,
    item_id: itemId
  });
  if (error) throw error;
  if (!data.deleted) throw new Error('Item not found');
  return mapProject(data.project);
}
