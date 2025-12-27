import React, { useState } from 'react';

const styles = {
  section: { padding: '2rem', maxWidth: 600, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2c3e50' },
  btn: { padding: '0.5rem 1.2rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem', marginBottom: 24 }
};

const Safety: React.FC = () => {
  const panicHotline = '988';
  const [showPanic, setShowPanic] = useState(false);
  const handlePanic = () => {
    setShowPanic(true);
    setTimeout(() => setShowPanic(false), 8000);
    window.open('tel:' + panicHotline, '_blank');
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🛟 Safety & Support</h2>
      <button onClick={handlePanic} style={styles.btn}>🚨 Panic Button: Call 988</button>
      {showPanic && (
        <div style={{background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: 10, padding: '1rem', marginBottom: 24, textAlign: 'center'}}>
          <strong>Help is on the way. Stay calm and breathe.</strong>
        </div>
      )}
      <h3>Emergency Contacts</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: 16 }}>
          <strong>988 Suicide & Crisis Lifeline (US):</strong> <a href="tel:988" style={{ color: '#3498db' }}>988</a>
        </li>
        <li style={{ marginBottom: 16 }}>
          <strong>National Domestic Violence Hotline:</strong> <a href="tel:1-800-799-7233" style={{ color: '#3498db' }}>1-800-799-7233</a>
        </li>
        <li style={{ marginBottom: 16 }}>
          <strong>Text HOME to 741741 (Crisis Text Line)</strong>
        </li>
        <li style={{ marginBottom: 16 }}>
          <strong>International Hotlines:</strong> <a href="https://www.opencounseling.com/suicide-hotlines" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>Find your country</a>
        </li>
      </ul>
      <div style={{ marginTop: '2rem', color: '#888', fontSize: '0.95rem', textAlign: 'center' }}>
        <span>If you are in immediate danger, please call emergency services or use the panic button above.</span>
      </div>
    </section>
  );
};

export default Safety;
