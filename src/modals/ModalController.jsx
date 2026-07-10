import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { uid } from '../utils/ids';
import { fetchYoutubeTitle } from '../utils/youtube';
import { KEY_OPTIONS, DIFFICULTY_OPTIONS, ROLE_STATUSES } from '../constants';

/** Slider range for the BPM picker — also the single source of truth for its clamp/default. */
const BPM_MIN = 40;
const BPM_MAX = 220;
const BPM_DEFAULT = 120;

function clampBpm(n) {
  return Math.min(BPM_MAX, Math.max(BPM_MIN, n));
}

/** Empty form state for each modal type. */
const blank = {
  project: { title: '', artist: '', bpm: BPM_DEFAULT, key: '', difficulty: 'Medium', driveUrl: '' },
  projectEdit: {
    title: '',
    artist: '',
    bpm: BPM_DEFAULT,
    key: '',
    difficulty: 'Medium',
    driveUrl: ''
  },
  member: { name: '', color: '#2458ad' },
  reference: { title: '', note: '', url: '' },
  role: { role: '', memberId: '', deadline: '', status: 'Not started', note: '' },
  stemLink: { roleId: '', memberId: '', label: '', url: '', status: 'Waiting' },
  videoLink: { roleId: '', memberId: '', label: '', url: '', status: 'Waiting' },
  mixLink: {
    label: '',
    url: '',
    status: 'For review',
    note: '',
    createdAt: new Date().toISOString().slice(0, 10)
  },
  section: { label: '', difficulty: 'Medium', note: '', members: '' },
  feedback: {
    author: '',
    memberId: '',
    role: '',
    message: '',
    createdAt: new Date().toLocaleString()
  }
};

/** Heading shown for each modal type. */
const titles = {
  project: 'Create Project',
  projectEdit: 'Edit Project Details',
  member: 'Add Member',
  reference: 'Add Reference Track',
  role: 'Add Role',
  stemLink: 'Add Stem Link',
  videoLink: 'Add Video Link',
  mixLink: 'Add Mix Draft',
  section: 'Add Song Section',
  feedback: 'Add Feedback'
};

/**
 * Single modal that renders the right form for `modal.type` and either creates
 * a project or appends an item to the active project's child collections.
 */
export default function ModalController({ modal, close, createProject, project, updateProject }) {
  const initial = { ...blank[modal.type] };

  if (modal.type === 'projectEdit' && project) {
    initial.title = project.title || '';
    initial.artist = project.artist || '';
    const numericBpm = Number(project.bpm);
    initial.bpm = Number.isFinite(numericBpm) ? clampBpm(numericBpm) : BPM_DEFAULT;
    initial.key = project.key || '';
    initial.difficulty = project.difficulty || 'Medium';
    initial.driveUrl = project.driveUrl || '';
  }

  if (modal.roleId && (modal.type === 'stemLink' || modal.type === 'videoLink')) {
    initial.roleId = modal.roleId;
  }

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  // The slider always shows *some* number even when the stored bpm is the
  // unset sentinel ('---') or old free-text (e.g. "Fast"). Only overwrite
  // the stored value if the user actually moved the slider/tapped tempo —
  // otherwise an untouched "just fixing the title" edit would silently
  // clobber it with the display default.
  const [bpmTouched, setBpmTouched] = useState(false);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addToProject(collection, item) {
    updateProject(project.id, (p) => ({ ...p, [collection]: [item, ...p[collection]] }));
    close();
  }

  async function submit(e) {
    e.preventDefault();
    if (modal.type === 'project') return createProject(form);
    if (!project) return;

    if (modal.type === 'projectEdit') {
      updateProject(project.id, (p) => ({
        ...p,
        title: form.title,
        artist: form.artist || 'Artist TBD',
        bpm: bpmTouched ? clampBpm(form.bpm) : project.bpm,
        key: form.key || '---',
        difficulty: form.difficulty || 'Medium',
        driveUrl: form.driveUrl || ''
      }));
      return close();
    }

    if (modal.type === 'reference') {
      let title = form.title.trim();
      if (!title) {
        setSaving(true);
        title = (await fetchYoutubeTitle(form.url)) || 'Untitled reference';
        setSaving(false);
      }
      return addToProject('references', { id: uid('ref'), ...form, title });
    }

    if (modal.type === 'member') return addToProject('members', { id: uid('member'), ...form });
    if (modal.type === 'role') return addToProject('roles', { id: uid('role'), ...form });
    if (modal.type === 'stemLink') return addToProject('stemLinks', { id: uid('stem'), ...form });
    if (modal.type === 'videoLink')
      return addToProject('videoLinks', { id: uid('video'), ...form });
    if (modal.type === 'mixLink') return addToProject('latestMixes', { id: uid('mix'), ...form });
    if (modal.type === 'feedback')
      return addToProject('feedback', { id: uid('feedback'), ...form });

    if (modal.type === 'section') {
      // Sections append to the end to preserve their arrangement order.
      updateProject(project.id, (p) => ({
        ...p,
        sections: [...p.sections, { id: uid('section'), ...form }]
      }));
      return close();
    }
  }

  const memberOptions = project?.members ?? [];
  const roleOptions = project?.roles ?? [];

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-header">
          <h2>{titles[modal.type]}</h2>
          <button type="button" onClick={close}>
            <X size={18} />
          </button>
        </div>

        {(modal.type === 'project' || modal.type === 'projectEdit') && (
          <div className="form-grid">
            <Field
              label="Project title"
              value={form.title}
              onChange={(v) => set('title', v)}
              required
            />
            <Field label="Artist" value={form.artist} onChange={(v) => set('artist', v)} />
            <BpmSlider
              value={form.bpm}
              onChange={(v) => {
                setBpmTouched(true);
                set('bpm', v);
              }}
            />
            <Select
              label="Key"
              value={form.key}
              onChange={(v) => set('key', v)}
              options={KEY_OPTIONS}
              placeholder="Select key"
            />
            <DifficultyPicker value={form.difficulty} onChange={(v) => set('difficulty', v)} />
            <Field
              label="Google Drive URL"
              value={form.driveUrl}
              onChange={(v) => set('driveUrl', v)}
            />
          </div>
        )}

        {modal.type === 'member' && (
          <div className="form-grid">
            <Field
              label="Member name"
              value={form.name}
              onChange={(v) => set('name', v)}
              required
            />
            <label className="color-field">
              <span>Color</span>

              <div className="color-picker-wrap">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  className="color-picker"
                />

                <span className="color-hex">{form.color}</span>
              </div>
            </label>
          </div>
        )}

        {modal.type === 'reference' && (
          <div className="form-grid">
            <Field
              label="Title (leave blank to use the YouTube title)"
              value={form.title}
              onChange={(v) => set('title', v)}
            />
            <Field label="URL" value={form.url} onChange={(v) => set('url', v)} />
            <TextArea label="Note" value={form.note} onChange={(v) => set('note', v)} />
          </div>
        )}

        {modal.type === 'role' && (
          <div className="form-grid">
            <Field label="Role" value={form.role} onChange={(v) => set('role', v)} required />
            <Select
              label="Member"
              value={form.memberId}
              onChange={(v) => set('memberId', v)}
              options={memberOptions.map((m) => [m.id, m.name])}
              placeholder="Unassigned"
            />
            <Field
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(v) => set('deadline', v)}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(v) => set('status', v)}
              options={ROLE_STATUSES}
            />
            <TextArea label="Note" value={form.note} onChange={(v) => set('note', v)} />
          </div>
        )}

        {(modal.type === 'stemLink' || modal.type === 'videoLink') && (
          <div className="form-grid">
            <Field label="Label" value={form.label} onChange={(v) => set('label', v)} required />
            <Field label="URL" value={form.url} onChange={(v) => set('url', v)} required />
            <Select
              label="Role"
              value={form.roleId}
              onChange={(v) => set('roleId', v)}
              options={roleOptions.map((r) => [r.id, r.role])}
              placeholder="No role"
            />
            <Select
              label="Member"
              value={form.memberId}
              onChange={(v) => set('memberId', v)}
              options={memberOptions.map((m) => [m.id, m.name])}
              placeholder="No member"
            />
            <Field label="Status" value={form.status} onChange={(v) => set('status', v)} />
          </div>
        )}

        {modal.type === 'mixLink' && (
          <div className="form-grid">
            <Field
              label="Mix label"
              value={form.label}
              onChange={(v) => set('label', v)}
              required
            />
            <Field label="URL" value={form.url} onChange={(v) => set('url', v)} required />
            <Field label="Status" value={form.status} onChange={(v) => set('status', v)} />
            <Field
              label="Date"
              type="date"
              value={form.createdAt}
              onChange={(v) => set('createdAt', v)}
            />
            <TextArea label="Note" value={form.note} onChange={(v) => set('note', v)} />
          </div>
        )}

        {modal.type === 'section' && (
          <div className="form-grid">
            <Field
              label="Section label"
              value={form.label}
              onChange={(v) => set('label', v)}
              required
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(v) => set('difficulty', v)}
              options={DIFFICULTY_OPTIONS}
            />
            <Field
              label="Members involved"
              value={form.members}
              onChange={(v) => set('members', v)}
            />
            <TextArea label="Arrangement note" value={form.note} onChange={(v) => set('note', v)} />
          </div>
        )}

        {modal.type === 'feedback' && (
          <div className="form-grid">
            <Field label="Author" value={form.author} onChange={(v) => set('author', v)} />
            <Select
              label="Member"
              value={form.memberId}
              onChange={(v) => set('memberId', v)}
              options={memberOptions.map((m) => [m.id, m.name])}
              placeholder="No member"
            />
            <Field label="Role" value={form.role} onChange={(v) => set('role', v)} />
            <TextArea
              label="Message"
              value={form.message}
              onChange={(v) => set('message', v)}
              required
            />
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <label className="full">
      {label}
      <textarea value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) =>
          Array.isArray(option) ? (
            <option key={option[0]} value={option[0]}>
              {option[1]}
            </option>
          ) : (
            <option key={option} value={option}>
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}

/**
 * BPM picker: a slider for coarse dragging plus a tap-tempo button for
 * setting it by feel — clicks in rhythm, we average the intervals. A dot
 * pulses at the current tempo so the number means something before you've
 * even hit save.
 */
function BpmSlider({ value, onChange }) {
  const bpm = Number.isFinite(Number(value)) ? clampBpm(Number(value)) : BPM_DEFAULT;
  const tapsRef = useRef([]);
  const [tapFlash, setTapFlash] = useState(false);

  function tap() {
    const now = Date.now();
    const recent = tapsRef.current.filter((t) => now - t < 2000);
    recent.push(now);
    tapsRef.current = recent;

    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 100);

    if (recent.length >= 2) {
      const intervals = recent.slice(1).map((t, i) => t - recent[i]);
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      onChange(clampBpm(Math.round(60000 / avgMs)));
    }
  }

  return (
    <label className="bpm-field">
      BPM
      <div className="bpm-control">
        <span className={`bpm-pulse ${tapFlash ? 'flash' : ''}`} style={{ animationDuration: `${60000 / bpm}ms` }} />
        <input
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={bpm}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <b className="bpm-readout">{bpm}</b>
        <button type="button" className="secondary-btn bpm-tap" onClick={tap}>
          Tap tempo
        </button>
      </div>
    </label>
  );
}

/** Difficulty as tactile chips instead of a dropdown — pick by feel, see it at a glance. */
const DIFFICULTY_EMOJI = { Easy: '🟢', Medium: '🟡', Hard: '🔴' };

function DifficultyPicker({ value, onChange }) {
  return (
    <div className="difficulty-field">
      Difficulty
      <div className="difficulty-chips">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            type="button"
            key={option}
            className={`difficulty-chip ${value === option ? 'active' : ''}`}
            onClick={() => onChange(option)}
          >
            <span>{DIFFICULTY_EMOJI[option]}</span> {option}
          </button>
        ))}
      </div>
    </div>
  );
}
