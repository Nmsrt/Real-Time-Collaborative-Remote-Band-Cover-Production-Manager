import React, { useState } from 'react';
import { X } from 'lucide-react';
import { uid } from '../utils/projectStorage';

const blank = {
  project: { title: '', artist: '', bpm: '', key: '', difficulty: 'Medium', driveUrl: '' },
  member: { name: '', color: '#2458ad' },
  reference: { title: '', note: '', url: '' },
  role: { role: '', memberId: '', deadline: '', status: 'Not started', note: '' },
  stemLink: { roleId: '', memberId: '', label: '', url: '', status: 'Waiting' },
  videoLink: { roleId: '', memberId: '', label: '', url: '', status: 'Waiting' },
  mixLink: { label: '', url: '', status: 'For review', note: '', createdAt: new Date().toISOString().slice(0, 10) },
  section: { label: '', difficulty: 'Medium', note: '', members: '' },
  feedback: { author: '', memberId: '', role: '', message: '', createdAt: new Date().toLocaleString() }
};

const titles = {
  project: 'Create Project',
  member: 'Add Member',
  reference: 'Add Reference Track',
  role: 'Add Role',
  stemLink: 'Add Stem Link',
  videoLink: 'Add Video Link',
  mixLink: 'Add Mix Draft',
  section: 'Add Song Section',
  feedback: 'Add Feedback'
};

export default function ModalController({ modal, close, createProject, project, updateProject }) {
  const initial = { ...blank[modal.type] };
  if (modal.roleId && (modal.type === 'stemLink' || modal.type === 'videoLink')) initial.roleId = modal.roleId;
  const [form, setForm] = useState(initial);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addToProject(collection, item) {
    updateProject(project.id, (p) => ({ ...p, [collection]: [item, ...p[collection]] }));
    close();
  }

  function submit(e) {
    e.preventDefault();
    if (modal.type === 'project') return createProject(form);
    if (!project) return;

    if (modal.type === 'member') return addToProject('members', { id: uid('member'), ...form });
    if (modal.type === 'reference') return addToProject('references', { id: uid('ref'), ...form });
    if (modal.type === 'role') return addToProject('roles', { id: uid('role'), ...form });
    if (modal.type === 'stemLink') return addToProject('stemLinks', { id: uid('stem'), ...form });
    if (modal.type === 'videoLink') return addToProject('videoLinks', { id: uid('video'), ...form });
    if (modal.type === 'mixLink') return addToProject('latestMixes', { id: uid('mix'), ...form });
    if (modal.type === 'section') return updateProject(project.id, (p) => ({ ...p, sections: [...p.sections, { id: uid('section'), ...form }] })) || close();
    if (modal.type === 'feedback') return addToProject('feedback', { id: uid('feedback'), ...form });
  }

  const memberOptions = project?.members ?? [];
  const roleOptions = project?.roles ?? [];

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-header">
          <h2>{titles[modal.type]}</h2>
          <button type="button" onClick={close}><X size={18}/></button>
        </div>

        {modal.type === 'project' && <div className="form-grid">
          <Field label="Project title" value={form.title} onChange={(v) => set('title', v)} required />
          <Field label="Artist" value={form.artist} onChange={(v) => set('artist', v)} />
          <Field label="BPM" value={form.bpm} onChange={(v) => set('bpm', v)} />
          <Field label="Key" value={form.key} onChange={(v) => set('key', v)} />
          <Select label="Difficulty" value={form.difficulty} onChange={(v) => set('difficulty', v)} options={['Easy', 'Medium', 'Hard']} />
          <Field label="Google Drive URL" value={form.driveUrl} onChange={(v) => set('driveUrl', v)} />
        </div>}

        {modal.type === 'member' && <div className="form-grid">
          <Field label="Member name" value={form.name} onChange={(v) => set('name', v)} required />
          <label>Color<input type="color" value={form.color} onChange={(e) => set('color', e.target.value)} /></label>
        </div>}

        {modal.type === 'reference' && <div className="form-grid">
          <Field label="Title" value={form.title} onChange={(v) => set('title', v)} required />
          <Field label="URL" value={form.url} onChange={(v) => set('url', v)} />
          <TextArea label="Note" value={form.note} onChange={(v) => set('note', v)} />
        </div>}

        {modal.type === 'role' && <div className="form-grid">
          <Field label="Role" value={form.role} onChange={(v) => set('role', v)} required />
          <Select label="Member" value={form.memberId} onChange={(v) => set('memberId', v)} options={memberOptions.map((m) => [m.id, m.name])} placeholder="Unassigned" />
          <Field label="Deadline" type="date" value={form.deadline} onChange={(v) => set('deadline', v)} />
          <Select label="Status" value={form.status} onChange={(v) => set('status', v)} options={['Not started', 'In progress', 'Submitted', 'Needs revision']} />
          <TextArea label="Note" value={form.note} onChange={(v) => set('note', v)} />
        </div>}

        {(modal.type === 'stemLink' || modal.type === 'videoLink') && <div className="form-grid">
          <Field label="Label" value={form.label} onChange={(v) => set('label', v)} required />
          <Field label="URL" value={form.url} onChange={(v) => set('url', v)} required />
          <Select label="Role" value={form.roleId} onChange={(v) => set('roleId', v)} options={roleOptions.map((r) => [r.id, r.role])} placeholder="No role" />
          <Select label="Member" value={form.memberId} onChange={(v) => set('memberId', v)} options={memberOptions.map((m) => [m.id, m.name])} placeholder="No member" />
          <Field label="Status" value={form.status} onChange={(v) => set('status', v)} />
        </div>}

        {modal.type === 'mixLink' && <div className="form-grid">
          <Field label="Mix label" value={form.label} onChange={(v) => set('label', v)} required />
          <Field label="URL" value={form.url} onChange={(v) => set('url', v)} required />
          <Field label="Status" value={form.status} onChange={(v) => set('status', v)} />
          <Field label="Date" type="date" value={form.createdAt} onChange={(v) => set('createdAt', v)} />
          <TextArea label="Note" value={form.note} onChange={(v) => set('note', v)} />
        </div>}

        {modal.type === 'section' && <div className="form-grid">
          <Field label="Section label" value={form.label} onChange={(v) => set('label', v)} required />
          <Select label="Difficulty" value={form.difficulty} onChange={(v) => set('difficulty', v)} options={['Easy', 'Medium', 'Hard']} />
          <Field label="Members involved" value={form.members} onChange={(v) => set('members', v)} />
          <TextArea label="Arrangement note" value={form.note} onChange={(v) => set('note', v)} />
        </div>}

        {modal.type === 'feedback' && <div className="form-grid">
          <Field label="Author" value={form.author} onChange={(v) => set('author', v)} />
          <Select label="Member" value={form.memberId} onChange={(v) => set('memberId', v)} options={memberOptions.map((m) => [m.id, m.name])} placeholder="No member" />
          <Field label="Role" value={form.role} onChange={(v) => set('role', v)} />
          <TextArea label="Message" value={form.message} onChange={(v) => set('message', v)} required />
        </div>}

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={close}>Cancel</button>
          <button type="submit" className="primary-btn">Save</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return <label>{label}<input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}

function TextArea({ label, value, onChange, required = false }) {
  return <label className="full">{label}<textarea value={value} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Select({ label, value, onChange, options, placeholder }) {
  return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{placeholder && <option value="">{placeholder}</option>}{options.map((option) => Array.isArray(option) ? <option key={option[0]} value={option[0]}>{option[1]}</option> : <option key={option} value={option}>{option}</option>)}</select></label>;
}
