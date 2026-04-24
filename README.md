# Collaborative Remote Band Cover Manager

CoverFlow is a real-time remote band cover management platform for organizing online music collaborations from first reference track to final mix.

It helps bands track projects, members, roles, stems, videos, references, mix drafts, song sections, feedback, and revision progress in one shared workspace.

## Run

```bash
npm install
npm run dev:full
```

Open:

```txt
http://localhost:5173
```

API test:

```txt
http://localhost:4000/api/projects
```

## Storage

Data is saved in SQLite through the backend server.

The database file is created at:

```txt
server/coverflow.sqlite
```

## Notes

Keep the terminal running while using the app. Press `Ctrl + C` to stop both the frontend and backend.

## Planned Features

### Google Drive Sync

- Connect Google Drive folders to each project
- Automatically link uploaded stems, videos, and mix drafts
- Keep project files organized by role and member
- Reduce manual copy-pasting of Drive links

### Own Music Player / Database

- Built-in music player for references and mix drafts
- Local project audio database
- Play, preview, and compare mix versions inside the app
- Track mix history without leaving the workspace

### Edit / Update Functionality
- Update member names and colors
- Edit references, roles, section notes, links, and feedback
- Improve project maintenance after initial creation

### Account Creation

- User accounts for band members and collaborators
- Login system for project access
- Role-based permissions for admins, members, and reviewers
- Personal dashboards for assigned tasks and submissions

### UI Changes

- Cleaner project dashboard
- Better responsive layout for smaller screens
- More polished cards, buttons, modals, and empty states
- Stronger visual hierarchy for active tasks and late submissions

### Activity Log

- Track actions made inside each project
- Show what was added, edited, or removed
- Record changes to roles, members, stems, videos, references, mix drafts, sections, and feedback
- Display timestamps for every project update
- Help members review recent project activity and avoid confusion
