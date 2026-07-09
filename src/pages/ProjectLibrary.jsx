import React, { useMemo, useState } from 'react';
import { Plus, PlayCircle, Trash2, Pencil, Search } from 'lucide-react';

/**
 * Grid of project cards with open/edit/delete actions and a create entry point.
 * Shows a search field once the library is big enough that scanning the
 * grid by eye stops being faster than typing.
 *
 * @param {Object} props
 * @param {import('../types').Project[]} props.projects
 * @param {(id: string) => void} props.openProject
 * @param {() => void} props.openCreate
 * @param {(id: string) => void} props.openEdit
 * @param {(id: string) => void} props.deleteProject
 */
export default function ProjectLibrary({
  projects,
  openProject,
  openCreate,
  openEdit,
  deleteProject
}) {
  const [query, setQuery] = useState('');

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      [project.title, project.artist].some((field) => field?.toLowerCase().includes(q))
    );
  }, [projects, query]);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Projects</h1>
        </div>
        <button className="primary-btn" onClick={openCreate}>
          <Plus size={16} /> Create Project
        </button>
      </div>

      {projects.length > 5 && (
        <div className="search-field">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by title or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
        </div>
      )}

      <div className="project-grid">
        {projects.length === 0 && (
          <article className="project-card">
            <p className="eyebrow">No projects yet</p>
            <h2>Create your first cover project</h2>
            <p>Start tracking references, roles, submissions, and mixes.</p>
            <button className="primary-btn" onClick={openCreate}>
              <Plus size={16} /> Create Project
            </button>
          </article>
        )}

        {projects.length > 0 && filteredProjects.length === 0 && (
          <article className="project-card">
            <p className="eyebrow">No matches</p>
            <h2>Nothing matches "{query}"</h2>
            <p>Try a different title or artist.</p>
          </article>
        )}

        {filteredProjects.map((project) => {
          const latestMix = project.latestMixes?.[0];
          return (
            <article className="project-card library-card" key={project.id}>
              <div className="project-card-main">
                <p className="eyebrow">{project.artist}</p>
                <h2>{project.title}</h2>
                <p>
                  {project.bpm} BPM · Key of {project.key} · {project.difficulty}
                </p>
              </div>
              <div className="project-card-actions">
                {latestMix ? (
                  <a
                    className="secondary-btn"
                    href={latestMix.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PlayCircle size={16} /> Latest Mix
                  </a>
                ) : (
                  <button className="secondary-btn disabled" type="button" disabled>
                    <PlayCircle size={16} /> No Mix Yet
                  </button>
                )}
                <button className="primary-btn" onClick={() => openProject(project.id)}>
                  Open Workspace
                </button>
                <div className="dropdown-menu">
                  <button className="secondary-btn icon-only" type="button">
                    ...
                  </button>

                  <div className="dropdown-content">
                    <button onClick={() => openEdit(project.id)}>
                      <Pencil size={16} /> Edit
                    </button>

                    <button className="danger-option" onClick={() => deleteProject(project.id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
