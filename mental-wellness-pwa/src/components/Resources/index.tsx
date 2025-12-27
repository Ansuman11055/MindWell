import React from 'react';

const styles = {
  section: { padding: '2rem', maxWidth: 600, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2c3e50' }
};

const resources = [
  {
    name: '988 Suicide & Crisis Lifeline (US)',
    desc: '24/7 free and confidential support for people in distress.',
    phone: '988',
    url: 'https://988lifeline.org/'
  },
  {
    name: 'SAMHSA National Helpline (US)',
    desc: 'Substance Abuse and Mental Health Services Administration.',
    phone: '1-800-662-HELP',
    url: 'https://www.samhsa.gov/find-help/national-helpline'
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    desc: 'Education, support, and advocacy for mental health.',
    url: 'https://nami.org/Home'
  },
  {
    name: 'Crisis Text Line',
    desc: 'Text HOME to 741741 for free, 24/7 crisis counseling.',
    url: 'https://www.crisistextline.org/'
  },
  {
    name: 'International Helplines',
    desc: 'Find mental health hotlines by country.',
    url: 'https://www.opencounseling.com/suicide-hotlines'
  }
];

const Resources: React.FC = () => (
  <section style={styles.section}>
    <h2 style={styles.sectionTitle}>📚 Mental Health Resources</h2>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {resources.map((r, i) => (
        <li key={i} style={{ marginBottom: 24, background: '#f8f9fa', borderRadius: 10, padding: '1.2rem' }}>
          <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: 6 }}>{r.name}</div>
          <div style={{ color: '#666', marginBottom: 8 }}>{r.desc}</div>
          {r.phone && <div style={{ marginBottom: 6 }}><strong>Phone:</strong> <a href={`tel:${r.phone}`} style={{ color: '#3498db' }}>{r.phone}</a></div>}
          <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'underline' }}>Learn more</a>
        </li>
      ))}
    </ul>
    <div style={{ marginTop: '2rem', color: '#888', fontSize: '0.95rem', textAlign: 'center' }}>
      <span>If you or someone you know is in crisis, please reach out to a professional or use one of the resources above.</span>
    </div>
  </section>
);

export default Resources;
