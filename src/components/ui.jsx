import React from 'react';
import { X, Plus } from 'lucide-react';

export function Stat({ icon, label, value, sub }) { return <article className="stat-card"><div className="stat-icon">{React.cloneElement(icon, { size: 20 })}</div><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>; }
export function Panel({ title, icon, children, action }) { return <section className="panel"><div className="panel-title"><div>{React.cloneElement(icon, { size: 20 })}<h2>{title}</h2></div>{action}</div>{children}</section>; }
export function MemberBadge({ member }) { if (!member) return <span className="member-badge muted">Unassigned</span>; return <span className="member-badge" style={{ '--member-color': member.color }}><i />{member.name}</span>; }

export function LinkStack({ links, empty, onAdd, onRemove }) {
  return <div className="link-stack">{links.length === 0 && <span className="empty-text">{empty}</span>}{links.map((link) => <div className="link-chip-row" key={link.id}><a className="link-chip" href={link.url} target="_blank" title={link.status}>{link.label}<small>{link.status}</small></a><button className="ghost-btn tiny" onClick={() => onRemove(link.id)}><X size={12}/></button></div>)}<button className="mini-add" onClick={onAdd}><Plus size={12}/> Add</button></div>;
}

export function LinksTable({ title, icon, links, roles, memberById, onAdd, onRemove }) {
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));
  return <Panel title={title} icon={icon} action={<button className="small-btn" onClick={onAdd}>Add link</button>}><div className="table-wrap compact"><table><thead><tr><th>Label</th><th>Role</th><th>Member</th><th>Status</th><th>Link</th><th></th></tr></thead><tbody>{links.length === 0 && <tr><td colSpan="6"><small>No links added yet.</small></td></tr>}{links.map((link) => { const role = roleById[link.roleId]; return <tr key={link.id}><td><strong>{link.label}</strong></td><td>{role?.role || 'Role removed'}</td><td><MemberBadge member={memberById[link.memberId]}/></td><td>{link.status}</td><td><a className="table-link" href={link.url} target="_blank">Open</a></td><td><button className="ghost-btn" onClick={() => onRemove(link.id)}><X size={14}/></button></td></tr> })}</tbody></table></div></Panel>;
}
