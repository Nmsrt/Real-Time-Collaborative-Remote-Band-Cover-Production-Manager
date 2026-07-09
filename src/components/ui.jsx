import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ADD_OPTION = '__add__';
const PLACEHOLDER = '';

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

/**
 * Version picker for a role's resource links (stems/videos): a dropdown of
 * every instance (label = version name, e.g. "Lead vocal stem v2") rather
 * than a stacked list of chips, so 3+ takes don't push the row taller than
 * it needs to be. Picking an option opens that link immediately and the
 * box itself always snaps back to showing a "Select {kind}" placeholder —
 * it's a one-shot opener, not a persistent selection, so the box never ends
 * up stuck displaying whichever version you last opened. "Add" is itself an
 * option in the same dropdown instead of a separate button, so an empty
 * role and one with five takes both render the exact same control.
 *
 * @param {string} kind - Noun used in the placeholder/add option, e.g. "stem".
 */
export function LinkStack({ links, onAdd, onRemove, kind = 'link' }) {
  const idsKey = links.map((link) => link.id).join(',');
  // Tracks which instance's remove button to show — separate from the
  // select's own value, which is always forced back to the placeholder.
  const [pickedId, setPickedId] = useState(null);

  useEffect(() => {
    setPickedId(null);
  }, [idsKey]);

  const selected = links.find((link) => link.id === pickedId);

  function handleChange(e) {
    const value = e.target.value;
    if (value === ADD_OPTION) {
      onAdd();
      return;
    }
    const link = links.find((l) => l.id === value);
    if (link?.url) window.open(link.url, '_blank', 'noopener,noreferrer');
    setPickedId(value);
  }

  return (
    <div className="link-picker">
      {links.length === 0 ? (
        // A <select> with only one option never fires onChange when that
        // option is (re)selected — it's already the value, nothing
        // "changes" — so clicking "+ Add" here did nothing. A plain button
        // (styled to match) sidesteps that native-select quirk entirely.
        <button type="button" className="link-picker-select link-picker-add" onClick={onAdd}>
          Add {kind} +
        </button>
      ) : (
        <select
          className="link-picker-select"
          value={PLACEHOLDER}
          onChange={handleChange}
          title={selected?.status}
        >
          <option value={PLACEHOLDER} disabled>
            Select {kind}
          </option>
          {links.map((link) => (
            <option key={link.id} value={link.id}>
              {link.label}
            </option>
          ))}
          <option value={ADD_OPTION} style={{ color: 'var(--success-fg)' }}>
            Add {kind} +
          </option>
        </select>
      )}
      {selected && (
        <button
          className="ghost-btn tiny"
          onClick={() => onRemove(selected.id)}
          aria-label={`Remove ${selected.label}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
