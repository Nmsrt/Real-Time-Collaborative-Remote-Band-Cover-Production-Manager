CREATE TABLE projects (id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, bpm TEXT, song_key TEXT, difficulty TEXT, drive_url TEXT);
CREATE TABLE members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL);
CREATE TABLE references_tracks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, note TEXT, url TEXT);
CREATE TABLE roles (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, role TEXT NOT NULL, member_id TEXT, deadline TEXT, status TEXT, note TEXT);
CREATE TABLE stem_links (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, role_id TEXT, member_id TEXT, label TEXT NOT NULL, url TEXT NOT NULL, status TEXT);
CREATE TABLE video_links (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, role_id TEXT, member_id TEXT, label TEXT NOT NULL, url TEXT NOT NULL, status TEXT);
CREATE TABLE latest_mixes (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, label TEXT NOT NULL, url TEXT NOT NULL, status TEXT, note TEXT, created_at TEXT);
CREATE TABLE sections (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, label TEXT NOT NULL, difficulty TEXT, note TEXT, members TEXT, sort_order INTEGER DEFAULT 0);
CREATE TABLE feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, author TEXT, member_id TEXT, role TEXT, message TEXT NOT NULL, created_at TEXT);
