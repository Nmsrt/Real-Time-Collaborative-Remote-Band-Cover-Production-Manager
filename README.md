<div align="center">

<!-- Replace with your project logo or banner -->
<img src="https://via.placeholder.com/120x120.png?text=LOGO" alt="Project Logo" width="120" height="120" />

<h1>CoverFlow</h1>

<p><em>A real-time remote band cover management platform — from first reference track to final mix, all in one shared workspace.</em></p>

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/ci.yml?branch=main)](https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/actions)
[![Issues](https://img.shields.io/github/issues/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager)](https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<br />

[Live Demo](https://your-demo-url.com) · [Report Bug](https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/issues/new?template=bug_report.md) · [Request Feature](https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/issues/new?template=feature_request.md)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Data Storage](#data-storage)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

---

## Overview

**CoverFlow** is a real-time collaborative platform built for remote bands managing cover song productions. It centralizes everything a band needs in one shared workspace — members, roles, stems, videos, references, mix drafts, song sections, feedback, and revision progress — so nothing gets lost across chats, Drive folders, or scattered links.

---

## Features

- ✅ **Project tracking** — Organize cover productions from reference track to final mix.
- ✅ **Member & role management** — Assign members to roles and track individual contributions.
- ✅ **Stems, videos & references** — Attach and organize all project assets in one place.
- ✅ **Mix draft management** — Track draft versions and revision history per project.
- ✅ **Song section breakdown** — Define and annotate individual sections of each song.
- ✅ **Feedback & revision tracking** — Log feedback and monitor revision progress collaboratively.
- ✅ **Real-time collaboration** — Shared workspace that updates across all connected members.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [React](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Database | [Supabase](https://supabase.com/) (Postgres) — the client talks to it directly via `@supabase/supabase-js`, no backend server |
| Dev Workflow | `npm run dev` (Vite only) |

There is no Express/Node API layer: the React app calls Supabase directly with the anon key, and Postgres Row Level Security policies control access (see [`sql/schema.sql`](sql/schema.sql)). This app has no login system, so those policies grant open read/write — the same effective access control a public, unauthenticated API would have.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 18.x`
- [npm](https://www.npmjs.com/) `>= 9.x`
- A [Supabase](https://supabase.com/) project (free tier is fine)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager.git
   cd Real-Time-Collaborative-Remote-Band-Cover-Production-Manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a Supabase project**, then create the schema: open the SQL editor for your project and run the contents of [`sql/schema.sql`](sql/schema.sql). This creates all tables, their foreign keys, the `upsert_project` function used for atomic saves, and the RLS policies that let the client read/write.

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in all four values from your project's **Settings → API** page:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — used by the browser; safe to expose.
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — used only by `scripts/seed.js`; never put the service-role key behind a `VITE_` prefix or in client code.

5. **(Optional) Seed demo data** into an empty project:
   ```bash
   npm run db:seed
   ```

6. **Start the dev server:**
   ```bash
   npm run dev
   ```

---

## Usage

Once running, open `http://localhost:5173` — the app talks straight to Supabase, no other process needed.

---

## Data Storage

All project data lives in your Supabase project's Postgres database. The React client reads/writes it directly via the anon key; Row Level Security policies (open read/write, since there's no login system) gate access instead of a backend. See [`sql/schema.sql`](sql/schema.sql) for the full table, policy, and function definitions.

---

## Project Structure

```
Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/
├── index.html
├── src/                       # React + Vite frontend
│   ├── api/                   # Supabase client + project data access
│   ├── components/            # Shared UI primitives and the sidebar
│   ├── modals/                # Modal form controller
│   ├── pages/                 # Home, Project Library, Project Workspace
│   ├── utils/                 # Small helpers (id generation)
│   ├── constants.js           # Shared option lists (keys, difficulty, statuses)
│   ├── types.js                # JSDoc type definitions for the project model
│   ├── App.jsx
│   └── main.jsx                # Entry point
├── sql/
│   └── schema.sql              # Postgres schema, RLS policies, upsert_project function
├── supabase/                  # Supabase CLI project (optional; config.toml + migrations/)
│   ├── config.toml
│   └── migrations/
├── scripts/
│   └── seed.js                 # Optional one-time demo data (npm run db:seed)
├── package.json
└── README.md
```

---

## Roadmap

- [x] Project creation and member management
- [x] Stems, videos, references, and mix draft tracking
- [x] Song section breakdown and feedback logging
- [ ] **Google Drive Sync** — Link Drive folders per project; auto-connect stems, videos, and mix drafts by role and member
- [ ] **Built-in Music Player** — Play, preview, and compare mix versions inside the app with a local audio database
- [ ] **Edit / Update Functionality** — Update member names, colors, roles, section notes, links, and feedback after creation
- [ ] **Account System** — User accounts, login, role-based permissions (admin / member / reviewer), and personal dashboards
- [ ] **UI Improvements** — Cleaner dashboard, better responsive layout, polished cards and modals, stronger visual hierarchy
- [ ] **Activity Log** — Per-project action history with timestamps, tracking all additions, edits, and removals across members and assets

---

## License

This project is open-source and available for personal use and inspiration.

---

## Contact

**Neo Monserrat** — neo.monserrat@gmail.com

Project Link: [https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager](https://github.com/Nmsrt/Real-Time-Collaborative-Remote-Band-Cover-Production-Manager)

## Development

Available npm scripts:

```bash
npm run dev        # Vite dev server
npm run db:seed    # Seed demo data into an empty Supabase project
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Format all files with Prettier
```

See [Project Structure](#project-structure) above for the full layout.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Nmsrt">Nmsrt</a></sub>
</div>
