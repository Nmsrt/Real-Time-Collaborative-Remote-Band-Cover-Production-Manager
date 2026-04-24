import React from 'react';
import {
  Users,
  RefreshCcw,
  CalendarClock,
  ListMusic,
  Link as LinkIcon,
  Upload,
  GripVertical,
  X,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  FolderOpen,
  PlayCircle,
  Headphones,
  Plus,
  Trash2,
  UserPlus,
  MoreHorizontal
} from 'lucide-react';

import { Stat, Panel, MemberBadge, LinkStack } from '../components/ui';

export default function ProjectWorkspace({ project, updateProject, deleteProject, goLibrary, openModal }) {
  const today = new Date().toISOString().slice(0, 10);
  const lateCount = project.roles.filter((role) => role.deadline && role.deadline < today && role.status !== 'Submitted').length;
  const submittedCount = project.roles.filter((role) => role.status === 'Submitted').length;
  const progress = project.roles.length ? Math.round((submittedCount / project.roles.length) * 100) : 0;

  const memberById = Object.fromEntries(project.members.map((m) => [m.id, m]));

  function updateRole(id, field, value) {
    updateProject(project.id, (p) => ({
      ...p,
      roles: p.roles.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    }));
  }

  function removeItem(type, id) {
    updateProject(project.id, (p) => ({
      ...p,
      [type]: p[type].filter((item) => item.id !== id)
    }));
  }

  function moveSection(index, direction) {
    updateProject(project.id, (p) => {
      const next = [...p.sections];
      const target = index + direction;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...p, sections: next };
    });
  }

  return (
    <section>
      <div className="workspace-hero">
        <div>
          <button className="text-btn" onClick={goLibrary}>← Back to library</button>
          <h1>{project.title}</h1>
          <p>{project.artist} · {project.bpm} BPM · Key of {project.key} · {project.difficulty}</p>

          <div className="hero-actions">
            {project.driveUrl && (
              <a className="pill-link" href={project.driveUrl} target="_blank" rel="noreferrer">
                <img src="/assets/Google-Drive.png" alt="Drive" className="drive-icon" />
                Google Drive
              </a>
            )}

            {/* ✅ DROPDOWN */}
            <div className="dropdown">
              <button className="kebab-btn" type="button">
                <MoreHorizontal size={18} />
              </button>

              

              <div className="dropdown-content">
                <button onClick={() => openModal({ type: 'reference' })}>
                  <Plus size={16}/> Add reference
                </button>

                <button onClick={() => openModal({ type: 'member' })}>
                  <UserPlus size={16}/> Add member
                </button>

                <button
                  className="danger-option"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 size={16}/> Delete project
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-card">
          <strong>In progress</strong><b>{progress}%</b>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <small>{progress === 100 ? 'Ready for Mixing.' : 'Ready for Mixing when all stems are submitted.'}</small>
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={<Users/>} label="Roles" value={project.roles.length} sub="assigned parts"/>
        <Stat icon={<RefreshCcw/>} label="Revisions" value={project.feedback.length} sub="needs attention"/>
        <Stat icon={<CalendarClock/>} label="Late" value={lateCount} sub="past deadline"/>
        {/* <Stat icon={<ListMusic/>} label="Sections" value={project.sections.length} sub="arrangement blocks"/> */}
      </div>

      <div className="workspace-grid">
        <div className="left-column">
          <Panel title="Reference Tracks" icon={<LinkIcon/>}>
            <div className="reference-grid">
              {project.references.length === 0 && <p className="empty-panel">No reference tracks yet.</p>}
              {project.references.map((ref) => (
                <div className="reference-card" key={ref.id}>
                  <button
                    className="ref-delete"
                    onClick={() => removeLink('references', ref.id)}
                  >
                    <X size={12} />
                  </button>

                  <a href={ref.url || '#'} target="_blank">
                    <strong>{ref.title}</strong>
                    <span>{ref.note}</span>
                  </a>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Assignments" icon={<Upload/>} action={<div className="panel-actions"><button className="primary-btn" onClick={() => openModal({ type: 'role' })}><Plus size={16}/> Add Task</button></div>}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Role</th><th>Member</th><th>Deadline</th><th>Status</th><th>Stem Links</th><th>Video Links</th><th></th></tr></thead>
                <tbody>
                  {project.roles.length === 0 && <tr><td colSpan="7"><small>No roles added yet.</small></td></tr>}
                  {project.roles.map((role) => {
                    const member = memberById[role.memberId];
                    const stems = project.stemLinks.filter((l) => l.roleId === role.id);
                    const videos = project.videoLinks.filter((l) => l.roleId === role.id);
                    return (
                      <tr key={role.id}>
                        <td><strong>{role.role}</strong><small>{role.note}</small></td>
                        <td><MemberBadge member={member}/></td>
                        <td>{role.deadline}</td>
                        <td><select className={`status-select ${role.status.replace(/\s/g, '-').toLowerCase()}`} value={role.status} onChange={(e) => updateRole(role.id, 'status', e.target.value)} ><option>Not started</option><option>In progress</option><option>Submitted</option><option>Needs revision</option></select></td>
                        <td><LinkStack links={stems} empty="No stem yet" onAdd={() => openModal({ type: 'stemLink', roleId: role.id })} onRemove={(id) => removeItem('stemLinks', id)} /></td>
                        <td><LinkStack links={videos} empty="No video yet" onAdd={() => openModal({ type: 'videoLink', roleId: role.id })} onRemove={(id) => removeItem('videoLinks', id)} /></td>
                        <td><button className="ghost-btn" onClick={() => removeRole(role.id)}><X size={14}/></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="dual-panel">
            <Panel title="Track Drafts" icon={<Headphones/>} action={<button className="small-btn" onClick={() => openModal({ type: 'mixLink' })}>Add mix</button>}>
              <div className="mix-list">
                {(project.latestMixes || []).length === 0 && <p className="empty-panel">No mix drafts linked yet.</p>}
                {(project.latestMixes || []).map((mix, index) => (
                  <article className="mix-row" key={mix.id}>
                    <div><span>{index === project.latestMixes.length - 1 ? 'Latest mix' : `Mix ${index + 1}`}</span><h3>{mix.label}</h3><p>{mix.note}</p><small>{mix.status} · {mix.createdAt}</small></div>
                    <div className="mix-actions"><a className="secondary-btn" href={mix.url} target="_blank" rel="noreferrer"><PlayCircle size={15}/></a><button className="ghost-btn" onClick={() => removeItem('latestMixes', mix.id)}><X size={14}/></button></div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="Song Structure" icon={<ListMusic/>} action={<button className="small-btn" onClick={() => openModal({ type: 'section' })}>Add section</button>}>
              <div className="structure-list">
                {project.sections.length === 0 && <p className="empty-panel">No sections yet.</p>}
                {project.sections.map((section, index) => (
                  <article className="section-row" key={section.id}>
                    <GripVertical size={18}/><div className="section-index">{String(index + 1).padStart(2, '0')}</div>
                    <div className="section-body"><span>{section.difficulty}</span><h3>{section.label}</h3><p>{section.note}</p><small>{section.members}</small></div>
                    <div className="move-buttons"><button onClick={() => moveSection(index, -1)}><ArrowUp size={15}/></button><button onClick={() => moveSection(index, 1)}><ArrowDown size={15}/></button><button onClick={() => removeItem('sections', section.id)}><X size={15}/></button></div>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <aside className="right-column">
          <Panel title="Members" icon={<Users/>}>
            <div className="member-list member-delete-list">
              {project.members.length === 0 && <p className="empty-panel">No members yet.</p>}
              {project.members.map((member) => <span className="member-delete" key={member.id}><MemberBadge member={member}/><button className="ghost-btn tiny" onClick={() => removeMember(member.id)}><X size={12}/></button></span>)}
            </div>
          </Panel>

          <Panel title="Notes" icon={<MessageSquare/>} action={<button className="small-btn" onClick={() => openModal({ type: 'feedback' })}>Add Notes</button>}>
            <div className="timeline-list">
              {project.feedback.length === 0 && <p className="empty-panel">No feedback yet.</p>}
              {project.feedback.map((fb) => (
                <article className="feedback-item" key={fb.id}>
                  <span className="dot" style={{ background: memberById[fb.memberId]?.color || '#2563eb' }}/>
                  <div className="feedback-top"><strong>{fb.author} @{memberById[fb.memberId]?.name || 'Member'}</strong><button className="ghost-btn tiny" onClick={() => removeItem('feedback', fb.id)}><X size={12}/></button></div>
                  <p>{fb.message}</p><small>{fb.role} · {fb.createdAt}</small>
                </article>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </section>
  );
}
