import React from 'react';
import { Home, Library, Plus, Music } from 'lucide-react';

export default function Sidebar({ page, setPage, openCreate }) {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Music size={18} /></div><div><strong>CoverFlow</strong><span>Remote Cover Manager</span></div></div>
      <nav className="nav-list">
        <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}><Home size={16} /> Home</button>
        <button className={page === 'library' || page === 'project' ? 'active' : ''} onClick={() => setPage('library')}><Library size={16} /> Project Library</button>
        <button onClick={openCreate}><Plus size={16} /> Create Project</button>
      </nav>
      <div className="sidebar-note">Wide, clean workspace for stems, videos, section notes, references, and review feedback.</div>
    </aside>
  );
}
