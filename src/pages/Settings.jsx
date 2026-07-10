import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Panel } from '../components/ui';

/**
 * App-level preferences. Currently just theme — the only setting the app
 * actually has — kept as its own page instead of buried in the sidebar
 * toggle alone so there's a real place to grow into as more settings show up.
 *
 * @param {Object} props
 * @param {string} props.theme - 'light' | 'dark'.
 * @param {() => void} props.onToggleTheme
 */
export default function Settings({ theme, onToggleTheme }) {
  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1>Settings</h1>
        </div>
      </div>

      <Panel title="Appearance" icon={theme === 'dark' ? <Moon /> : <Sun />}>
        <p className="settings-row-label">Theme</p>
        <div className="theme-choice">
          <button
            type="button"
            className={`difficulty-chip ${theme === 'light' ? 'active' : ''}`}
            onClick={() => theme !== 'light' && onToggleTheme()}
          >
            <Sun size={15} /> Light
          </button>
          <button
            type="button"
            className={`difficulty-chip ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => theme !== 'dark' && onToggleTheme()}
          >
            <Moon size={15} /> Dark
          </button>
        </div>
      </Panel>
    </section>
  );
}
