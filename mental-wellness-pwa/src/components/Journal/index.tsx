import React, { useState, useEffect } from 'react';

const styles = {
  section: { padding: '2rem', maxWidth: 600, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2c3e50' },
  textarea: { width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: '1rem' },
  btn: { padding: '0.5rem 1.2rem', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }
};

const Journal: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<{date: string, text: string}[]>([]);
  const [journalText, setJournalText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('journalEntries');
    if (saved) setJournalEntries(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  const todayJournal = journalEntries.find(e => e.date === new Date().toISOString().slice(0,10));
  const handleSaveJournal = () => {
    const today = new Date().toISOString().slice(0,10);
    if (journalText.trim()) {
      setJournalEntries(prev => {
        const filtered = prev.filter(e => e.date !== today);
        return [{date: today, text: journalText.trim()}, ...filtered];
      });
      setJournalText('');
    }
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>📓 Daily Journal</h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={journalText}
          onChange={e => setJournalText(e.target.value)}
          placeholder="Write your thoughts, feelings, or anything on your mind..."
          style={{ ...styles.textarea, minHeight: 120, marginBottom: 12 }}
        />
        <button onClick={handleSaveJournal} style={styles.btn} disabled={!journalText.trim()}>Save Entry</button>
      </div>
      <h3 style={{marginTop: '2rem'}}>Previous Entries</h3>
      {journalEntries.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>No journal entries yet. Start writing above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {journalEntries.map(entry => (
            <li key={entry.date} style={{ marginBottom: 18, background: '#f8f9fa', borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: 6 }}>{new Date(entry.date).toLocaleDateString()}</div>
              <div style={{ whiteSpace: 'pre-line', color: '#333' }}>{entry.text}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Journal;
