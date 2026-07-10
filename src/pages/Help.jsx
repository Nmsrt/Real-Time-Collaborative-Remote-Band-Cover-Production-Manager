import React from 'react';
import { HelpCircle, Upload, ListMusic, Headphones, Users, MessageSquare } from 'lucide-react';
import { Panel } from '../components/ui';

const TOPICS = [
  {
    icon: <Upload />,
    title: 'Assignments',
    body: 'Assign a role to a member, track its deadline and status, and attach stem/video links as work comes in.'
  },
  {
    icon: <ListMusic />,
    title: 'Structure & References',
    body: 'Lay out the song’s sections in order, and collect reference tracks alongside them. Paste a YouTube link and leave the title blank to auto-fill it from the video.'
  },
  {
    icon: <Headphones />,
    title: 'Track Drafts',
    body: 'Link rough mixes as they come in so the band can review the latest version without digging through chat history.'
  },
  {
    icon: <Users />,
    title: 'Members',
    body: 'Add everyone working on the cover; each gets a color used throughout the project to identify their work at a glance.'
  },
  {
    icon: <MessageSquare />,
    title: 'Notes',
    body: 'Leave feedback tied to a member so revision requests stay attached to the person who needs to act on them.'
  }
];

/** Static reference for what each project tab is for. */
export default function Help() {
  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Reference</p>
          <h1>Help</h1>
        </div>
      </div>

      <Panel title="Project tabs" icon={<HelpCircle />}>
        <div className="help-topics">
          {TOPICS.map((topic) => (
            <article className="help-topic" key={topic.title}>
              {React.cloneElement(topic.icon, { size: 18 })}
              <div>
                <h3>{topic.title}</h3>
                <p>{topic.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}
