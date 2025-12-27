import React, { useState } from 'react';

const styles = {
  section: { padding: '2rem', maxWidth: 600, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2c3e50' },
  btn: { padding: '0.5rem 1.2rem', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem', marginBottom: 8 }
};

const mindfulnessTools = [
  {
    id: 'breathing',
    name: '4-7-8 Breathing',
    desc: 'Calming breathing technique to reduce anxiety and stress.',
    steps: [
      'Inhale quietly through your nose for 4 seconds.',
      'Hold your breath for 7 seconds.',
      'Exhale completely through your mouth for 8 seconds.',
      'Repeat for 3-4 cycles.'
    ]
  },
  {
    id: 'grounding',
    name: '5-4-3-2-1 Grounding',
    desc: 'Ground yourself in the present moment using your senses.',
    steps: [
      'Name 5 things you can see.',
      'Name 4 things you can touch.',
      'Name 3 things you can hear.',
      'Name 2 things you can smell.',
      'Name 1 thing you can taste.'
    ]
  },
  {
    id: 'meditation',
    name: '2-Minute Mindful Meditation',
    desc: 'A short guided meditation to help you reset.',
    steps: [
      'Sit comfortably and close your eyes.',
      'Focus on your breath, noticing each inhale and exhale.',
      'If your mind wanders, gently bring your attention back to your breath.',
      'Continue for 2 minutes.'
    ]
  }
];

const MindfulnessTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🧘 Mindfulness Tools</h2>
      {selectedTool ? (
        <div style={{maxWidth: 500, margin: '0 auto'}}>
          <button onClick={() => setSelectedTool(null)} style={styles.btn}>&larr; Back</button>
          <h3 style={{marginBottom: 8}}>{mindfulnessTools.find(t => t.id === selectedTool)?.name}</h3>
          <p style={{color: '#666', marginBottom: 16}}>{mindfulnessTools.find(t => t.id === selectedTool)?.desc}</p>
          <ol style={{marginLeft: 20}}>
            {mindfulnessTools.find(t => t.id === selectedTool)?.steps.map((step, i) => (
              <li key={i} style={{marginBottom: 8}}>{step}</li>
            ))}
          </ol>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
          {mindfulnessTools.map(tool => (
            <div key={tool.id} style={{background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{marginBottom: 8}}>{tool.name}</h3>
              <p style={{color: '#666', marginBottom: 16}}>{tool.desc}</p>
              <button onClick={() => setSelectedTool(tool.id)} style={styles.btn}>Try</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MindfulnessTools;
