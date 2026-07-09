import React, { useEffect, useRef, useState } from 'react';
import { Menu, Music, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ProjectLibrary from './pages/ProjectLibrary';
import ProjectWorkspace from './pages/ProjectWorkspace';
import ModalController from './modals/ModalController';
import {
  createProjectApi,
  deleteProjectApi,
  deleteProjectItemApi,
  fetchProjects,
  saveProjectApi
} from './api/projectsApi';

// Field edits (deadline pickers, status selects, section reordering) fire
// updateProject on every change; debouncing the network save coalesces a
// burst of edits into a single upsert_project round trip instead of one
// full-project resave per change.
const SAVE_DEBOUNCE_MS = 500;

/**
 * Root component. Owns project state plus the loading/saving/error/theme flags,
 * and coordinates the sidebar, pages, and modal controller against the API.
 */
export default function App() {
  const [projects, setProjects] = useState([]);
  const projectsRef = useRef(projects);
  const saveTimers = useRef({});
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

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

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

  async function persistProject(projectId, nextProject) {
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

  // React may not have flushed `projects` state from a same-tick prior call
  // yet, so track the latest optimistic state in a ref updated synchronously
  // — otherwise a burst of edits (e.g. dragging a deadline picker) could each
  // compute their update off a stale snapshot and clobber one another.
  function updateProject(projectId, updater) {
    const currentProject = projectsRef.current.find((project) => project.id === projectId);
    if (!currentProject) return;

    const nextProject = updater(currentProject);
    projectsRef.current = projectsRef.current.map((project) =>
      project.id === projectId ? nextProject : project
    );
    setProjects(projectsRef.current);

    clearTimeout(saveTimers.current[projectId]);
    saveTimers.current[projectId] = setTimeout(() => {
      delete saveTimers.current[projectId];
      persistProject(projectId, nextProject);
    }, SAVE_DEBOUNCE_MS);
  }

  async function removeProjectItem(projectId, collection, itemId) {
    const currentProject = projects.find((project) => project.id === projectId);
    if (!currentProject) return;

    const optimisticProject = {
      ...currentProject,
      [collection]: currentProject[collection].filter((item) => item.id !== itemId)
    };
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? optimisticProject : project))
    );

    try {
      setSaving(true);
      setError('');
      const savedProject = await deleteProjectItemApi(projectId, collection, itemId);
      setProjects((current) =>
        current.map((project) => (project.id === savedProject.id ? savedProject : project))
      );
    } catch (err) {
      setError(err.message || 'Could not delete item from the database.');
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
        <button
          className="topbar-brand"
          type="button"
          onClick={() => setPage('library')}
          aria-label="Go to Project Library"
        >
          <Music size={18} />
          <strong>CoverFlow</strong>
        </button>
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
            Saving to Supabase...
          </div>
        )}

        {loading && (
          <section className="panel empty-state">
            <h2>
              <span className="spinner lg" aria-hidden="true" /> Loading projects...
            </h2>
            <p>Getting data from Supabase.</p>
          </section>
        )}

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
            removeProjectItem={removeProjectItem}
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
