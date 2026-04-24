import React from 'react';

export default function HomePage({ goLibrary }) {
  return <section className="hero-card"><p className="eyebrow">Remote band workflow</p><h1>Manage your online cover from first demo to final mix.</h1><p>Track responsibilities, references, stem links, video takes, arrangement notes, member colors, and feedback in one clean workspace.</p><button className="primary-btn" onClick={goLibrary}>Open Project Library</button></section>;
}
