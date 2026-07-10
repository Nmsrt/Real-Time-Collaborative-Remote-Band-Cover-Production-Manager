import React, { useState } from 'react';
import {
  Users,
  ListMusic,
  Link as LinkIcon,
  Upload,
  GripVertical,
  X,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  PlayCircle,
  Headphones,
  Plus,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

import { Panel, MemberBadge, LinkStack } from '../components/ui';
import { ROLE_STATUSES } from '../constants';
import { youtubeId } from '../utils/youtube';

/** Dot color per role status — the select itself stays neutral. */
const STATUS_DOT = {
  'Not started': 'var(--neutral-fg)',
  'In progress': 'var(--warning-fg)',
  Submitted: 'var(--success-fg)',
  'Needs revision': 'var(--error-fg)'
};

/**
 * Detailed workspace for a single project: roles, references, mixes,
 * arrangement sections, members, and feedback.
 *
 * @param {Object} props
 * @param {import('../types').Project} props.project
 * @param {(id: string, updater: (project: import('../types').Project) => import('../types').Project) => void} props.updateProject
 * @param {(id: string) => void} props.deleteProject
 * @param {() => void} props.goLibrary
 * @param {(modal: Object) => void} props.openModal
 */
export default function ProjectWorkspace({
  project,
  updateProject,
  removeProjectItem,
  deleteProject,
  goLibrary,
  openModal
}) {
  const today = new Date().toISOString().slice(0, 10);
  const submittedCount = project.roles.filter((role) => role.status === 'Submitted').length;
  const progress = project.roles.length
    ? Math.round((submittedCount / project.roles.length) * 100)
    : 0;

  const memberById = Object.fromEntries(project.members.map((member) => [member.id, member]));

  const [activeTab, setActiveTab] = useState('assignments');
  const tabs = [
    { key: 'assignments', label: 'Assignments', icon: <Upload /> },
    { key: 'structure', label: 'Structure & References', icon: <ListMusic /> },
    { key: 'drafts', label: 'Track Drafts', icon: <Headphones /> },
    { key: 'members', label: 'Members', icon: <Users /> },
    { key: 'notes', label: 'Notes', icon: <MessageSquare /> }
  ];

  function updateRole(id, field, value) {
    updateProject(project.id, (p) => ({
      ...p,
      roles: p.roles.map((role) => (role.id === id ? { ...role, [field]: value } : role))
    }));
  }

  /**
   * Remove an item from one of the project's child collections via a
   * targeted single-row delete (not a full-project resave).
   * @param {keyof import('../types').Project} collection
   * @param {string} id
   */
  function removeItem(collection, id) {
    removeProjectItem(project.id, collection, id);
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
          <button className="text-btn" onClick={goLibrary}>
            ← Back to library
          </button>
          <h1>{project.title}</h1>
          <p>
            {project.artist} · {project.bpm} BPM · Key of {project.key} · {project.difficulty}
          </p>

          <div className="hero-actions">
            {project.driveUrl && (
              <a className="pill-link" href={project.driveUrl} target="_blank" rel="noreferrer">
                <img src="/assets/Google-Drive.png" alt="Drive" className="drive-icon" />
                Google Drive
              </a>
            )}

            <div className="dropdown">
              <button className="kebab-btn" type="button">
                <MoreHorizontal size={18} />
              </button>

              <div className="dropdown-content">
                <button className="danger-option" onClick={() => deleteProject(project.id)}>
                  <Trash2 size={16} /> Delete project
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-card">
          <strong>In progress</strong>
          <b>{progress}%</b>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>
            {progress === 100
              ? 'Ready for Mixing.'
              : 'Ready for Mixing when all stems are submitted.'}
          </small>
        </div>
      </div>

      <div className="workspace-tabs" role="tablist" aria-label="Workspace sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {React.cloneElement(tab.icon, { size: 15 })}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="workspace-panel-slot">
          {activeTab === 'assignments' && (
            <Panel
              title="Assignments"
              icon={<Upload />}
              action={
                <div className="panel-actions">
                  <button className="primary-btn" onClick={() => openModal({ type: 'role' })}>
                    <Plus size={16} /> Add Task
                  </button>
                </div>
              }
            >
              <div className="table-wrap">
                <table>
                  <colgroup>
                    <col style={{ width: '210px' }} />
                    <col style={{ width: '170px' }} />
                    <col style={{ width: '168px' }} />
                    <col style={{ width: '172px' }} />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '56px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Member</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Stems</th>
                      <th>Videos</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.roles.length === 0 && (
                      <tr>
                        <td colSpan="7">
                          <small>No roles added yet.</small>
                        </td>
                      </tr>
                    )}
                    {project.roles.map((role) => {
                      const member = memberById[role.memberId];
                      const stems = project.stemLinks.filter((link) => link.roleId === role.id);
                      const videos = project.videoLinks.filter((link) => link.roleId === role.id);
                      const isLate =
                        role.deadline && role.deadline < today && role.status !== 'Submitted';
                      return (
                        <tr key={role.id}>
                          <td data-label="Role">
                            <strong>{role.role}</strong>
                            <small>{role.note}</small>
                          </td>
                          <td data-label="Member">
                            <div
                              className={`member-badge member-select ${member ? '' : 'muted'}`}
                              style={{ '--member-color': member ? member.color : 'var(--muted)' }}
                            >
                              <i />
                              <select
                                value={role.memberId || ''}
                                onChange={(e) => updateRole(role.id, 'memberId', e.target.value)}
                                aria-label={`Reassign ${role.role}`}
                              >
                                <option value="">Unassigned</option>
                                {project.members.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td data-label="Deadline">
                            <input
                              type="date"
                              className={`deadline-input ${isLate ? 'late' : ''}`}
                              value={role.deadline || ''}
                              onChange={(e) => updateRole(role.id, 'deadline', e.target.value)}
                              aria-label={`Deadline for ${role.role}${isLate ? ' (overdue)' : ''}`}
                            />
                          </td>
                          <td data-label="Status">
                            <div
                              className="status-picker"
                              style={{ '--status-color': STATUS_DOT[role.status] || 'var(--muted)' }}
                            >
                              <i />
                              <select
                                className="status-select"
                                value={role.status}
                                onChange={(e) => updateRole(role.id, 'status', e.target.value)}
                              >
                                {ROLE_STATUSES.map((status) => (
                                  <option key={status}>{status}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td data-label="Stems">
                            <LinkStack
                              links={stems}
                              kind="stem"
                              onAdd={() => openModal({ type: 'stemLink', roleId: role.id })}
                              onRemove={(id) => removeItem('stemLinks', id)}
                            />
                          </td>
                          <td data-label="Videos">
                            <LinkStack
                              links={videos}
                              kind="video"
                              onAdd={() => openModal({ type: 'videoLink', roleId: role.id })}
                              onRemove={(id) => removeItem('videoLinks', id)}
                            />
                          </td>
                          <td className="row-remove">
                            <button
                              className="ghost-btn"
                              onClick={() => removeItem('roles', role.id)}
                              aria-label={`Remove ${role.role}`}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {activeTab === 'drafts' && (
            <Panel
              title="Track Drafts"
              icon={<Headphones />}
              action={
                <button className="small-btn" onClick={() => openModal({ type: 'mixLink' })}>
                  Add mix
                </button>
              }
            >
              <div className="mix-list">
                {(project.latestMixes || []).length === 0 && (
                  <p className="empty-panel">No mix drafts linked yet.</p>
                )}
                {(project.latestMixes || []).map((mix, index) => (
                  <article className="mix-row" key={mix.id}>
                    <div>
                      <span>{index === 0 ? 'Latest mix' : `Mix ${index + 1}`}</span>
                      <h3>{mix.label}</h3>
                      <p>{mix.note}</p>
                      <small>
                        {mix.status} · {mix.createdAt}
                      </small>
                    </div>
                    <div className="mix-actions">
                      <a className="secondary-btn" href={mix.url} target="_blank" rel="noreferrer">
                        <PlayCircle size={15} />
                      </a>
                      <button
                        className="ghost-btn"
                        onClick={() => removeItem('latestMixes', mix.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === 'structure' && (
            <div className="split-panels">
              <Panel
                title="Song Structure"
                icon={<ListMusic />}
                action={
                  <button className="small-btn" onClick={() => openModal({ type: 'section' })}>
                    Add section
                  </button>
                }
              >
                <div className="structure-list">
                  {project.sections.length === 0 && <p className="empty-panel">No sections yet.</p>}
                  {project.sections.map((section, index) => (
                    <article className="section-row" key={section.id}>
                      <GripVertical size={18} />
                      <div className="section-index">{String(index + 1).padStart(2, '0')}</div>
                      <div className="section-body">
                        <span>{section.difficulty}</span>
                        <h3>{section.label}</h3>
                        <p>{section.note}</p>
                        <small>{section.members}</small>
                      </div>
                      <div className="move-buttons">
                        <button onClick={() => moveSection(index, -1)}>
                          <ArrowUp size={15} />
                        </button>
                        <button onClick={() => moveSection(index, 1)}>
                          <ArrowDown size={15} />
                        </button>
                        <button onClick={() => removeItem('sections', section.id)}>
                          <X size={15} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel
                title="Reference Tracks"
                icon={<LinkIcon />}
                action={
                  <button className="small-btn" onClick={() => openModal({ type: 'reference' })}>
                    Add reference
                  </button>
                }
              >
                <div className="reference-grid">
                  {project.references.length === 0 && (
                    <p className="empty-panel">No reference tracks yet.</p>
                  )}
                  {project.references.map((ref) => {
                    const ytId = youtubeId(ref.url);
                    return (
                      <div className="reference-card" key={ref.id}>
                        <button
                          className="ref-delete"
                          onClick={() => removeItem('references', ref.id)}
                        >
                          <X size={12} />
                        </button>

                        <a href={ref.url || '#'} target="_blank" rel="noreferrer">
                          {ytId && (
                            <img
                              className="reference-thumb"
                              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                              alt=""
                              loading="lazy"
                            />
                          )}
                          <strong>{ref.title}</strong>
                          <span>{ref.note}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'members' && (
            <Panel
              title="Members"
              icon={<Users />}
              action={
                <button className="small-btn" onClick={() => openModal({ type: 'member' })}>
                  Add member
                </button>
              }
            >
              <div className="member-list member-delete-list">
                {project.members.length === 0 && <p className="empty-panel">No members yet.</p>}
                {project.members.map((member) => (
                  <span className="member-delete" key={member.id}>
                    <MemberBadge member={member} />
                    <button
                      className="ghost-btn tiny"
                      onClick={() => removeItem('members', member.id)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === 'notes' && (
            <Panel
              title="Notes"
              icon={<MessageSquare />}
              action={
                <button className="small-btn" onClick={() => openModal({ type: 'feedback' })}>
                  Add Notes
                </button>
              }
            >
              <div className="timeline-list">
                {project.feedback.length === 0 && <p className="empty-panel">No feedback yet.</p>}
                {project.feedback.map((fb) => (
                  <article className="feedback-item" key={fb.id}>
                    <span
                      className="dot"
                      style={{ background: memberById[fb.memberId]?.color || '#2563eb' }}
                    />
                    <div className="feedback-top">
                      <strong>
                        {fb.author} @{memberById[fb.memberId]?.name || 'Member'}
                      </strong>
                      <button
                        className="ghost-btn tiny"
                        onClick={() => removeItem('feedback', fb.id)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p>{fb.message}</p>
                    <small>
                      {fb.role} · {fb.createdAt}
                    </small>
                  </article>
                ))}
              </div>
            </Panel>
          )}
      </div>
    </section>
  );
}
