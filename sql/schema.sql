-- CoverFlow schema for Supabase (Postgres).
-- Run this once in the Supabase SQL editor (or via the Supabase CLI, see
-- supabase/migrations/) against a fresh project. IDs are app-generated text
-- (see src/utils/ids.js), not Postgres identities. `seq` columns are a
-- monotonic insert-order surrogate for Postgres, since Postgres has no
-- implicit rowid like SQLite: ordering by `seq` gives "most recently
-- inserted first/last" without resetting on unrelated updates.
--
-- The React client talks to Supabase directly with the anon key (see
-- src/api/supabaseClient.js) — there is no backend server. This app has no
-- auth/login system, so RLS policies below grant the anon role open READ
-- access. Add real policies scoped to auth.uid() if login is added.
--
-- Writes are NOT granted via RLS at all: the policies below are select-only,
-- so a direct PostgREST call (POST/PATCH/DELETE on a table) is rejected
-- regardless of the anon/authenticated table grants Supabase sets up by
-- default. All mutations (create/save/delete) go through the `security
-- definer` functions at the bottom of this file instead, which run with the
-- function owner's privileges (bypassing RLS) and are the only place that
-- can write — a real enforced choke point, not just a convention, so that's
-- the one place to add ownership checks to later.
--
-- The per-collection column lists below are duplicated across get_project(),
-- upsert_project(), and src/api/projectsApi.js's mapProject/COLLECTION_TABLES
-- — there's no generated-types step tying them together, so a field added to
-- one must be added to all three by hand.

create table if not exists projects (
  id text primary key,
  seq bigserial,
  title text not null,
  artist text,
  bpm text,
  song_key text,
  difficulty text,
  drive_url text
);

create table if not exists members (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  name text not null,
  color text not null
);

create table if not exists references_tracks (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  note text,
  url text
);

create table if not exists roles (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  role text not null,
  member_id text references members(id) on delete set null,
  deadline text,
  status text,
  note text
);

create table if not exists stem_links (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  role_id text references roles(id) on delete cascade,
  member_id text references members(id) on delete set null,
  label text not null,
  url text not null,
  status text
);

create table if not exists video_links (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  role_id text references roles(id) on delete cascade,
  member_id text references members(id) on delete set null,
  label text not null,
  url text not null,
  status text
);

create table if not exists latest_mixes (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  label text not null,
  url text not null,
  status text,
  note text,
  created_at text
);

create table if not exists sections (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  label text not null,
  difficulty text,
  note text,
  members text,
  sort_order integer default 0
);

create table if not exists feedback (
  id text primary key,
  seq bigserial,
  project_id text not null references projects(id) on delete cascade,
  author text,
  member_id text references members(id) on delete set null,
  role text,
  message text not null,
  created_at text
);

create index if not exists members_project_id_idx on members(project_id);
create index if not exists references_tracks_project_id_idx on references_tracks(project_id);
create index if not exists roles_project_id_idx on roles(project_id);
create index if not exists stem_links_project_id_idx on stem_links(project_id);
create index if not exists video_links_project_id_idx on video_links(project_id);
create index if not exists latest_mixes_project_id_idx on latest_mixes(project_id);
create index if not exists sections_project_id_idx on sections(project_id);
create index if not exists feedback_project_id_idx on feedback(project_id);

alter table projects enable row level security;
alter table members enable row level security;
alter table references_tracks enable row level security;
alter table roles enable row level security;
alter table stem_links enable row level security;
alter table video_links enable row level security;
alter table latest_mixes enable row level security;
alter table sections enable row level security;
alter table feedback enable row level security;

create policy "public read" on projects for select using (true);
create policy "public read" on members for select using (true);
create policy "public read" on references_tracks for select using (true);
create policy "public read" on roles for select using (true);
create policy "public read" on stem_links for select using (true);
create policy "public read" on video_links for select using (true);
create policy "public read" on latest_mixes for select using (true);
create policy "public read" on sections for select using (true);
create policy "public read" on feedback for select using (true);
-- No insert/update/delete policies: RLS default-denies writes for every
-- role, so direct table writes via PostgREST are rejected. Only the
-- `security definer` functions below can write.

-- Returns one project fully hydrated (core fields + every child collection as
-- a nested array), shaped exactly like the embedded PostgREST select in
-- src/api/projectsApi.js's PROJECT_SELECT so mapProject() there can read
-- either interchangeably. Shared by upsert_project/create_project so both
-- return the fresh row directly, instead of the caller doing a second
-- round-trip select after every write.
create or replace function get_project(pid text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', p.id, 'title', p.title, 'artist', p.artist, 'bpm', p.bpm,
    'song_key', p.song_key, 'difficulty', p.difficulty, 'drive_url', p.drive_url,
    'members', coalesce(
      (select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name, 'color', m.color))
       from members m where m.project_id = p.id), '[]'::jsonb),
    'references_tracks', coalesce(
      (select jsonb_agg(jsonb_build_object('id', r.id, 'title', r.title, 'note', r.note, 'url', r.url))
       from references_tracks r where r.project_id = p.id), '[]'::jsonb),
    'roles', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', ro.id, 'role', ro.role, 'member_id', ro.member_id,
         'deadline', ro.deadline, 'status', ro.status, 'note', ro.note))
       from roles ro where ro.project_id = p.id), '[]'::jsonb),
    'stem_links', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', s.id, 'role_id', s.role_id, 'member_id', s.member_id,
         'label', s.label, 'url', s.url, 'status', s.status)
         order by s.seq desc)
       from stem_links s where s.project_id = p.id), '[]'::jsonb),
    'video_links', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', v.id, 'role_id', v.role_id, 'member_id', v.member_id,
         'label', v.label, 'url', v.url, 'status', v.status)
         order by v.seq desc)
       from video_links v where v.project_id = p.id), '[]'::jsonb),
    'latest_mixes', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', lm.id, 'label', lm.label, 'url', lm.url,
         'status', lm.status, 'note', lm.note, 'created_at', lm.created_at)
         order by lm.seq desc)
       from latest_mixes lm where lm.project_id = p.id), '[]'::jsonb),
    'sections', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', se.id, 'label', se.label, 'difficulty', se.difficulty,
         'note', se.note, 'members', se.members)
         order by se.sort_order asc)
       from sections se where se.project_id = p.id), '[]'::jsonb),
    'feedback', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', f.id, 'author', f.author, 'member_id', f.member_id,
         'role', f.role, 'message', f.message, 'created_at', f.created_at)
         order by f.seq desc)
       from feedback f where f.project_id = p.id), '[]'::jsonb)
  )
  from projects p
  where p.id = pid;
$$;

-- Insert a new project from its core details and return it hydrated (a
-- brand-new project always has empty child collections, so get_project()
-- here is cheap — no joins actually match anything yet).
create or replace function create_project(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pid text := 'project-' || (extract(epoch from clock_timestamp()) * 1000)::bigint || '-' || substr(md5(random()::text), 1, 13);
begin
  if coalesce(payload->>'title', '') = '' then
    raise exception 'a project title is required' using errcode = 'P0001';
  end if;

  insert into projects (id, title, artist, bpm, song_key, difficulty, drive_url)
  values (
    pid,
    payload->>'title',
    coalesce(payload->>'artist', 'Artist TBD'),
    coalesce(payload->>'bpm', '---'),
    coalesce(payload->>'key', '---'),
    coalesce(payload->>'difficulty', 'Medium'),
    coalesce(payload->>'driveUrl', '')
  );
  return get_project(pid);
end;
$$;

-- Sync a project's core fields and all of its child collections against the
-- incoming JSON payload (delete rows no longer present, upsert the rest)
-- inside a single Postgres transaction, then return the freshly hydrated
-- project — replacing both the old SQLite "delete all child rows, reinsert
-- everything" approach and the extra round-trip re-select the client used to
-- do after every save.
--
-- Two defenses baked in:
--  - `where value->>'id' is not null` on every delete-diff subquery: SQL
--    `NOT IN` against a list containing NULL evaluates to UNKNOWN for every
--    row, which would silently no-op the whole delete if any payload item
--    were ever missing its id. Filtering nulls out of the subquery first
--    means a malformed item just can't protect an existing row from deletion,
--    instead of accidentally protecting all of them.
--  - `where <table>.project_id = pid` on every ON CONFLICT DO UPDATE: without
--    it, a payload `id` that collides with a row belonging to a *different*
--    project would silently overwrite that other project's row (upsert only
--    matches on the global primary key, not project_id). The guard makes
--    that case a no-op instead of cross-project data corruption.
-- memberId/roleId in the payload are also nulled out here if they don't match
-- a row in that same payload's own members/roles arrays (defends against a
-- stale reference from a delete that didn't cascade client-side).
create or replace function upsert_project(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pid text := payload->>'id';
  valid_member_ids text[];
  valid_role_ids text[];
begin
  update projects set
    title = payload->>'title',
    artist = payload->>'artist',
    bpm = payload->>'bpm',
    song_key = payload->>'key',
    difficulty = payload->>'difficulty',
    drive_url = coalesce(payload->>'driveUrl', '')
  where id = pid;

  if not found then
    raise exception 'project % not found', pid using errcode = 'P0002';
  end if;

  select coalesce(array_agg(value->>'id'), '{}')
    into valid_member_ids
    from jsonb_array_elements(coalesce(payload->'members', '[]'::jsonb));

  select coalesce(array_agg(value->>'id'), '{}')
    into valid_role_ids
    from jsonb_array_elements(coalesce(payload->'roles', '[]'::jsonb));

  -- members
  delete from members
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'members', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into members (id, project_id, name, color)
  select value->>'id', pid, value->>'name', value->>'color'
  from jsonb_array_elements(coalesce(payload->'members', '[]'::jsonb))
  on conflict (id) do update set name = excluded.name, color = excluded.color
    where members.project_id = pid;

  -- reference tracks
  delete from references_tracks
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'references', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into references_tracks (id, project_id, title, note, url)
  select value->>'id', pid, value->>'title', coalesce(value->>'note', ''), coalesce(value->>'url', '')
  from jsonb_array_elements(coalesce(payload->'references', '[]'::jsonb))
  on conflict (id) do update set title = excluded.title, note = excluded.note, url = excluded.url
    where references_tracks.project_id = pid;

  -- roles (memberId sanitized against this payload's own members)
  delete from roles
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'roles', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into roles (id, project_id, role, member_id, deadline, status, note)
  select
    value->>'id', pid, value->>'role',
    case when value->>'memberId' = any(valid_member_ids) then value->>'memberId' else null end,
    coalesce(value->>'deadline', ''), coalesce(value->>'status', 'Not started'), coalesce(value->>'note', '')
  from jsonb_array_elements(coalesce(payload->'roles', '[]'::jsonb))
  on conflict (id) do update set
    role = excluded.role, member_id = excluded.member_id, deadline = excluded.deadline,
    status = excluded.status, note = excluded.note
    where roles.project_id = pid;

  -- stem links (roleId/memberId sanitized against this payload's own roles/members)
  delete from stem_links
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'stemLinks', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into stem_links (id, project_id, role_id, member_id, label, url, status)
  select
    value->>'id', pid,
    case when value->>'roleId' = any(valid_role_ids) then value->>'roleId' else null end,
    case when value->>'memberId' = any(valid_member_ids) then value->>'memberId' else null end,
    value->>'label', value->>'url', coalesce(value->>'status', 'Waiting')
  from jsonb_array_elements(coalesce(payload->'stemLinks', '[]'::jsonb))
  on conflict (id) do update set
    role_id = excluded.role_id, member_id = excluded.member_id, label = excluded.label,
    url = excluded.url, status = excluded.status
    where stem_links.project_id = pid;

  -- video links (same sanitization as stem links)
  delete from video_links
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'videoLinks', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into video_links (id, project_id, role_id, member_id, label, url, status)
  select
    value->>'id', pid,
    case when value->>'roleId' = any(valid_role_ids) then value->>'roleId' else null end,
    case when value->>'memberId' = any(valid_member_ids) then value->>'memberId' else null end,
    value->>'label', value->>'url', coalesce(value->>'status', 'Waiting')
  from jsonb_array_elements(coalesce(payload->'videoLinks', '[]'::jsonb))
  on conflict (id) do update set
    role_id = excluded.role_id, member_id = excluded.member_id, label = excluded.label,
    url = excluded.url, status = excluded.status
    where video_links.project_id = pid;

  -- latest mixes
  delete from latest_mixes
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'latestMixes', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into latest_mixes (id, project_id, label, url, status, note, created_at)
  select
    value->>'id', pid, value->>'label', value->>'url', coalesce(value->>'status', 'For review'),
    coalesce(value->>'note', ''), coalesce(value->>'createdAt', now()::text)
  from jsonb_array_elements(coalesce(payload->'latestMixes', '[]'::jsonb))
  on conflict (id) do update set
    label = excluded.label, url = excluded.url, status = excluded.status,
    note = excluded.note, created_at = excluded.created_at
    where latest_mixes.project_id = pid;

  -- sections (sort_order re-derived from array position on every save)
  delete from sections
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'sections', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into sections (id, project_id, label, difficulty, note, members, sort_order)
  select
    value->>'id', pid, value->>'label', value->>'difficulty',
    coalesce(value->>'note', ''), coalesce(value->>'members', ''), ordinality - 1
  from jsonb_array_elements(coalesce(payload->'sections', '[]'::jsonb)) with ordinality
  on conflict (id) do update set
    label = excluded.label, difficulty = excluded.difficulty, note = excluded.note,
    members = excluded.members, sort_order = excluded.sort_order
    where sections.project_id = pid;

  -- feedback (memberId sanitized against this payload's own members)
  delete from feedback
    where project_id = pid
    and id not in (
      select value->>'id' from jsonb_array_elements(coalesce(payload->'feedback', '[]'::jsonb))
      where value->>'id' is not null
    );
  insert into feedback (id, project_id, author, member_id, role, message, created_at)
  select
    value->>'id', pid, coalesce(value->>'author', ''),
    case when value->>'memberId' = any(valid_member_ids) then value->>'memberId' else null end,
    coalesce(value->>'role', ''), value->>'message', coalesce(value->>'createdAt', now()::text)
  from jsonb_array_elements(coalesce(payload->'feedback', '[]'::jsonb))
  on conflict (id) do update set
    author = excluded.author, member_id = excluded.member_id, role = excluded.role,
    message = excluded.message, created_at = excluded.created_at
    where feedback.project_id = pid;

  return get_project(pid);
end;
$$;

-- Delete a project and all of its related rows (FK ON DELETE CASCADE).
create or replace function delete_project(pid text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  deleted_id text;
begin
  delete from projects where id = pid returning id into deleted_id;
  return deleted_id is not null;
end;
$$;

-- Delete a single row from a known child table, then return the project
-- re-hydrated via get_project(). table_name is checked against an explicit
-- allowlist before being interpolated (via format('%I')) into dynamic SQL,
-- so this can't be used to touch an arbitrary table. Returning the fresh
-- project here means the client applies the DB's own FK cascade/set-null
-- results directly instead of re-implementing those FK rules in JS to keep
-- optimistic local state in sync (the two would otherwise need to be kept
-- in sync by hand with nothing enforcing it).
create or replace function delete_project_item(table_name text, pid text, item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  affected int;
begin
  if table_name not in (
    'members', 'references_tracks', 'roles', 'stem_links',
    'video_links', 'latest_mixes', 'sections', 'feedback'
  ) then
    raise exception 'invalid table: %', table_name;
  end if;

  execute format('delete from %I where project_id = $1 and id = $2', table_name)
    using pid, item_id;
  get diagnostics affected = row_count;

  return jsonb_build_object('deleted', affected > 0, 'project', get_project(pid));
end;
$$;

grant execute on function get_project(text) to anon, authenticated;
grant execute on function create_project(jsonb) to anon, authenticated;
grant execute on function upsert_project(jsonb) to anon, authenticated;
grant execute on function delete_project(text) to anon, authenticated;
grant execute on function delete_project_item(text, text, text) to anon, authenticated;
