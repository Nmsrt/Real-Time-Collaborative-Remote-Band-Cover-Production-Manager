import React from 'react';
import { Plus, PlayCircle, Trash2 } from 'lucide-react';

export default function ProjectLibrary({ projects, openProject, openCreate, deleteProject }) {
  return (
    <section>
      <div className="page-header">
        <div><p className="eyebrow">Library</p><h1>Projects</h1></div>
        <button className="primary-btn" onClick={openCreate}><Plus size={16}/> Create Project</button>
      </div>
      <div className="project-grid">
        {projects.length === 0 && (
          <article className="project-card">
            <p className="eyebrow">No projects yet</p>
            <h2>Create your first cover project</h2>
            <p>Start tracking references, roles, submissions, and mixes.</p>
            <button className="primary-btn" onClick={openCreate}><Plus size={16}/> Create Project</button>
          </article>
        )}

        {projects.map((project) => {
          const latestMix = project.latestMixes?.[project.latestMixes.length - 1];
          return (
            <article className="project-card library-card" key={project.id}>
              <div className="project-card-main">
                <p className="eyebrow">{project.artist}</p>
                <h2>{project.title}</h2>
                <p>{project.bpm} BPM · Key of {project.key} · {project.difficulty}</p>
              </div>
              <div className="project-card-actions">
                {latestMix ? (
                  <a className="secondary-btn" href={latestMix.url} target="_blank" rel="noreferrer"><PlayCircle size={16}/> Latest Mix</a>
                ) : (
                  <button className="secondary-btn disabled" type="button" disabled><PlayCircle size={16}/> No Mix Yet</button>
                )}
                <button className="primary-btn" onClick={() => openProject(project.id)}>Open Workspace</button>
                <button className="danger-btn" onClick={() => deleteProject(project.id)} title="Delete project"><Trash2 size={16}/> Delete</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
