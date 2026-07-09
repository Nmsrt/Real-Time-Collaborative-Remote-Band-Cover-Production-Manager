import React, { useEffect, useState } from 'react';
import { Menu, Music, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import ProjectLibrary from './pages/ProjectLibrary';
import ProjectWorkspace from './pages/ProjectWorkspace';
import ModalController from './modals/ModalController';
import {
  createProjectApi,
  deleteProjectApi,
  fetchProjects,
  saveProjectApi
} from './api/projectsApi';

/**
 * Root component. Owns project state plus the loading/saving/error/theme flags,
 * and coordinates the sidebar, pages, and modal controller against the API.
 */
export default function App() {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState('library');
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [navOpen, setNavOpen] = useState(false);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  const closeNav = () => setNavOpen(false);

  useEffect(() => {
    loadProjectsFromApi();
  }, []);

  // Lock background scroll while the mobile navigation drawer is open.
  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  // Close the drawer when the viewport grows to the desktop layout.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 821px)');
    const handleChange = (event) => {
      if (event.matches) setNavOpen(false);
    };
    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  async function loadProjectsFromApi() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProjects();
      setProjects(data);
      setSelectedId((current) => current ?? data[0]?.id ?? null);
    } catch (err) {
      setError(err.message || 'Could not load projects from the server.');
    } finally {
      setLoading(false);
    }
  }

  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects[0] ?? null;

  async function updateProject(projectId, updater) {
    const currentProject = projects.find((project) => project.id === projectId);
    if (!currentProject) return;

    const nextProject = updater(currentProject);
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? nextProject : project))
    );

    try {
      setSaving(true);
      setError('');
      const savedProject = await saveProjectApi(nextProject);
      setProjects((current) =>
        current.map((project) => (project.id === savedProject.id ? savedProject : project))
      );
    } catch (err) {
      setError(err.message || 'Could not save changes. Reloading the server version.');
      await loadProjectsFromApi();
    } finally {
      setSaving(false);
    }
  }

  async function createProject(data) {
    try {
      setSaving(true);
      setError('');
      const newProject = await createProjectApi(data);
      setProjects((current) => [newProject, ...current]);
      setSelectedId(newProject.id);
      setPage('project');
      setModal(null);
    } catch (err) {
      setError(err.message || 'Could not create project.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(projectId) {
    const project = projects.find((candidate) => candidate.id === projectId);
    if (!project) return;

    const ok = window.confirm(
      `Delete "${project.title}"? This removes its members, references, roles, links, mixes, sections, and feedback from the database.`
    );
    if (!ok) return;

    const previousProjects = projects;
    const nextProjects = projects.filter((candidate) => candidate.id !== projectId);

    setProjects(nextProjects);
    if (selectedId === projectId) {
      setSelectedId(nextProjects[0]?.id ?? null);
      setPage('library');
    }

    try {
      setSaving(true);
      setError('');
      await deleteProjectApi(projectId);
    } catch (err) {
      setProjects(previousProjects);
      setError(err.message || 'Could not delete project from the database.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`app-shell ${theme}-theme`}>
      {/* Mobile-only top bar: hamburger opens the nav drawer; quick theme toggle. */}
      <header className="topbar">
        <button
          className="icon-btn hamburger-btn"
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={navOpen}
        >
          <Menu size={22} />
        </button>
        <div className="topbar-brand">
          <Music size={18} />
          <strong>CoverFlow</strong>
        </div>
        <button
          className="icon-btn"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <Sidebar
        page={page}
        setPage={setPage}
        openCreate={() => setModal({ type: 'project' })}
        open={navOpen}
        onClose={closeNav}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {navOpen && <div className="sidebar-overlay" onClick={closeNav} aria-hidden="true" />}

      <main className="main-area">
        {error && <div className="status-banner error">{error}</div>}
        {saving && (
          <div className="status-banner">
            <span className="spinner" aria-hidden="true" />
            Saving to SQLite database...
          </div>
        )}

        {loading && (
          <section className="panel empty-state">
            <h2>
              <span className="spinner lg" aria-hidden="true" /> Loading projects...
            </h2>
            <p>Getting data from the Express API.</p>
          </section>
        )}

        {!loading && page === 'home' && <HomePage goLibrary={() => setPage('library')} />}
        {!loading && page === 'library' && (
          <ProjectLibrary
            projects={projects}
            openProject={(id) => {
              setSelectedId(id);
              setPage('project');
            }}
            openEdit={(id) => {
              setSelectedId(id);
              setModal({ type: 'projectEdit' });
            }}
            openCreate={() => setModal({ type: 'project' })}
            deleteProject={deleteProject}
          />
        )}
        {!loading && page === 'project' && selectedProject && (
          <ProjectWorkspace
            project={selectedProject}
            updateProject={updateProject}
            deleteProject={deleteProject}
            goLibrary={() => setPage('library')}
            openModal={setModal}
          />
        )}
        {!loading && page === 'project' && !selectedProject && (
          <section className="panel empty-state">
            <h2>No project selected</h2>
            <p>Create a project or open one from the library.</p>
            <button className="primary-btn" onClick={() => setModal({ type: 'project' })}>
              Create Project
            </button>
          </section>
        )}
      </main>
      {modal && (
        <ModalController
          modal={modal}
          close={() => setModal(null)}
          createProject={createProject}
          project={selectedProject}
          updateProject={updateProject}
        />
      )}
    </div>
  );
}
