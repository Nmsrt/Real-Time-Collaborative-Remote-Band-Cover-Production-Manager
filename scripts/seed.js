// One-off seed script for a fresh Supabase project. Run with:
//   npm run db:seed
// Uses the service-role key (server-side only, never the client bundle) so
// it can write regardless of RLS policies. Safe to re-run: it exits without
// writing if the `projects` table already has any rows.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function seed() {
  const { count, error: countError } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true });
  if (countError) throw countError;
  if (count > 0) {
    console.log(`projects table already has ${count} row(s); skipping seed.`);
    return;
  }

  const projectId = 'when-you-look-me-in-the-eyes';

  const { error: projectError } = await supabase.from('projects').insert({
    id: projectId,
    title: 'When You Look Me in the Eyes',
    artist: 'Jonas Brothers',
    bpm: '138',
    song_key: 'G',
    difficulty: 'Medium',
    drive_url: 'https://drive.google.com/'
  });
  if (projectError) throw projectError;

  const members = [
    { id: 'm-antonio', name: 'Antonio', color: '#1f5fbf' },
    { id: 'm-gio', name: 'Gio', color: '#7e22ce' },
    { id: 'm-franz', name: 'Franz', color: '#b45309' },
    { id: 'm-pablo', name: 'Pablo', color: '#7c3aed' },
    { id: 'm-chyle', name: 'Chyle', color: '#be123c' }
  ];
  await insert('members', members.map((m) => ({ ...m, project_id: projectId })));

  const refs = [
    {
      id: 'ref-1',
      title: 'Official Music Video',
      note: 'Use for structure and vocal phrasing.',
      url: 'https://youtube.com/'
    },
    {
      id: 'ref-2',
      title: 'Live Acoustic Reference',
      note: 'Use for dynamics and softer verse energy.',
      url: 'https://youtube.com/'
    },
    { id: 'ref-3', title: 'Band Cover Peg', note: 'Use for instrument balance.', url: 'https://youtube.com/' }
  ];
  await insert('references_tracks', refs.map((r) => ({ ...r, project_id: projectId })));

  const roles = [
    {
      id: 'role-1',
      role: 'Lead Vocals',
      member_id: 'm-antonio',
      deadline: '2026-05-02',
      status: 'Not started',
      note: 'Use main take 03.'
    },
    {
      id: 'role-2',
      role: 'Drums',
      member_id: 'm-gio',
      deadline: '2026-04-29',
      status: 'Submitted',
      note: 'Need clap sync before first chorus.'
    },
    {
      id: 'role-3',
      role: 'Lead Guitar',
      member_id: 'm-franz',
      deadline: '2026-05-01',
      status: 'Needs revision',
      note: 'Timing slightly late during chorus.'
    },
    {
      id: 'role-4',
      role: 'Bass',
      member_id: 'm-pablo',
      deadline: '2026-05-03',
      status: 'Not started',
      note: 'Follow root notes for verse.'
    },
    { id: 'role-5', role: 'Triangle', member_id: 'm-chyle', deadline: '2026-04-10', status: 'Not started', note: '' }
  ];
  await insert('roles', roles.map((r) => ({ ...r, project_id: projectId })));

  await insert('stem_links', [
    {
      id: 'stem-1',
      project_id: projectId,
      role_id: 'role-1',
      member_id: 'm-antonio',
      label: 'Lead vocal stem v1',
      url: 'https://drive.google.com/',
      status: 'Approved'
    },
    {
      id: 'stem-2',
      project_id: projectId,
      role_id: 'role-3',
      member_id: 'm-franz',
      label: 'Lead guitar stem v2',
      url: 'https://drive.google.com/',
      status: 'Needs revision'
    }
  ]);

  await insert('video_links', [
    {
      id: 'vid-1',
      project_id: projectId,
      role_id: 'role-1',
      member_id: 'm-antonio',
      label: 'Lead vocal camera take',
      url: 'https://drive.google.com/',
      status: 'Approved'
    },
    {
      id: 'vid-2',
      project_id: projectId,
      role_id: 'role-3',
      member_id: 'm-franz',
      label: 'Lead guitar video take',
      url: 'https://drive.google.com/',
      status: 'Needs reshoot'
    }
  ]);

  await insert('latest_mixes', [
    {
      id: 'mix-1',
      project_id: projectId,
      label: 'Rough Mix v1',
      url: 'https://drive.google.com/',
      status: 'For review',
      note: 'First full-band balance check.',
      created_at: '2026-04-24'
    },
    {
      id: 'mix-2',
      project_id: projectId,
      label: 'Latest Mix v2',
      url: 'https://drive.google.com/',
      status: 'Latest',
      note: 'Cleaner vocal level and guitar timing fixes.',
      created_at: '2026-04-25'
    }
  ]);

  const sections = [
    { id: 'sec-1', label: 'Intro', difficulty: 'Easy', note: 'Soft entry. Piano and clean guitar only.', members: 'Piano, Guitar', sort_order: 0 },
    { id: 'sec-2', label: 'Verse', difficulty: 'Medium', note: 'Keep drums minimal. Vocals should stay intimate.', members: 'Vocals, Guitar, Bass', sort_order: 1 },
    { id: 'sec-3', label: 'Chorus', difficulty: 'Hard', note: 'Full band. Add harmonies on last line.', members: 'All members', sort_order: 2 },
    { id: 'sec-4', label: 'Bridge', difficulty: 'Medium', note: 'Drop to pads then build back up.', members: 'Vocals, Keys, Drums', sort_order: 3 }
  ];
  await insert('sections', sections.map((s) => ({ ...s, project_id: projectId })));

  await insert('feedback', [
    {
      id: 'fb-1',
      project_id: projectId,
      author: 'Mixer',
      member_id: 'm-franz',
      role: 'Lead Guitar',
      message: 'Guitar timing is off at the chorus. Please submit a cleaner take.',
      created_at: '24/04/2026, 05:43:13'
    }
  ]);

  console.log('Seeded project "when-you-look-me-in-the-eyes".');
}

async function insert(table, rows) {
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw error;
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
