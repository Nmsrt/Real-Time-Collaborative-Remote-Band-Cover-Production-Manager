import React from 'react';
import { Home, Library, Plus, Music, X } from 'lucide-react';

/**
 * Primary navigation. On desktop it is a fixed column; on mobile it becomes an
 * off-canvas drawer toggled by the top-bar hamburger (`open` / `onClose`).
 *
 * @param {Object} props
 * @param {string} props.page - Active page key.
 * @param {(page: string) => void} props.setPage
 * @param {() => void} props.openCreate
 * @param {boolean} props.open - Whether the mobile drawer is visible.
 * @param {() => void} props.onClose - Close the mobile drawer.
 * @param {string} props.theme - 'light' | 'dark'.
 * @param {() => void} props.onToggleTheme
 */
export default function Sidebar({
  page,
  setPage,
  openCreate,
  open,
  onClose,
  theme,
  onToggleTheme
}) {
  const isLibraryActive = page === 'library' || page === 'project';

  // Run a nav action, then dismiss the drawer so the chosen page is visible.
  const navigate = (action) => () => {
    action();
    onClose?.();
  };

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head">
        <div className="brand">
          <div className="brand-mark">
            <Music size={18} />
          </div>
          <div>
            <strong>CoverFlow</strong>
            <span>Remote Cover Manager</span>
          </div>
        </div>
        <button
          className="icon-btn sidebar-close"
          type="button"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="nav-list">
        <button
          className={page === 'home' ? 'active' : ''}
          onClick={navigate(() => setPage('home'))}
        >
          <Home size={16} /> Home
        </button>
        <button
          className={isLibraryActive ? 'active' : ''}
          onClick={navigate(() => setPage('library'))}
        >
          <Library size={16} /> Project Library
        </button>
        <button onClick={navigate(openCreate)}>
          <Plus size={16} /> Create Project
        </button>
      </nav>

      <button className="theme-toggle-sidebar" type="button" onClick={onToggleTheme}>
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>
    </aside>
  );
}
