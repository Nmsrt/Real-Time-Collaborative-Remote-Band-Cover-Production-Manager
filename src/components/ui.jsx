import React from 'react';
import { X, Plus } from 'lucide-react';

/** Compact metric card used in the workspace stats grid. */
export function Stat({ icon, label, value, sub }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{React.cloneElement(icon, { size: 20 })}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </article>
  );
}

/** Titled content section with an icon and an optional action slot. */
export function Panel({ title, icon, children, action }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          {React.cloneElement(icon, { size: 20 })}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Colored chip for a band member, or a muted "Unassigned" placeholder. */
export function MemberBadge({ member }) {
  if (!member) return <span className="member-badge muted">Unassigned</span>;
  return (
    <span className="member-badge" style={{ '--member-color': member.color }}>
      <i />
      {member.name}
    </span>
  );
}

/** Vertical list of resource links (stems/videos) with add and remove actions. */
export function LinkStack({ links, empty, onAdd, onRemove }) {
  return (
    <div className="link-stack">
      {links.length === 0 && <span className="empty-text">{empty}</span>}
      {links.map((link) => (
        <div className="link-chip-row" key={link.id}>
          <a
            className="link-chip"
            href={link.url}
            target="_blank"
            rel="noreferrer"
            title={link.status}
          >
            {link.label}
            <small>{link.status}</small>
          </a>
          <button className="ghost-btn tiny" onClick={() => onRemove(link.id)}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button className="mini-add" onClick={onAdd}>
        <Plus size={12} /> Add
      </button>
    </div>
  );
}
