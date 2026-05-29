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
| Backend | [Node.js](https://nodejs.org/) API server |
| Database | [SQLite](https://www.sqlite.org/) (via backend server) |
| Dev Workflow | Concurrent frontend + backend (`dev:full`) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 18.x`
- [npm](https://www.npmjs.com/) `>= 9.x`

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

3. **Start the development servers:**
   ```bash
   npm run dev:full
   ```

   > ⚠️ Keep the terminal running while using the app. Press `Ctrl + C` to stop both the frontend and backend.

---

## Usage

Once running, open the following in your browser:

| Service | URL |
|---|---|
| Frontend app | `http://localhost:5173` |
| Backend API | `http://localhost:4000/api/projects` |

---

## Data Storage

All project data is persisted in a local SQLite database managed by the backend server.

| Location | Contents |
|---|---|
| `server/coverflow.sqlite` | Main database — projects, members, roles, stems, feedback, and more |

The database file is created automatically on first run.

---

## Project Structure

```
Real-Time-Collaborative-Remote-Band-Cover-Production-Manager/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # App views/routes
│   │   └── main.jsx          # Entry point
│   └── index.html
├── server/                   # Node.js backend
│   ├── routes/               # API route handlers
│   ├── coverflow.sqlite      # Auto-generated SQLite database
│   └── index.js              # Server entry point
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

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Nmsrt">Nmsrt</a></sub>
</div>
