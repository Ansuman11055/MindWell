import React, { useEffect, useState } from 'react';
import { dbService } from '../../utils/database';

const styles = {
  section: { padding: '2rem', maxWidth: 600, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2c3e50' },
  btn: { padding: '0.5rem 1.2rem', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem', marginTop: 16 }
};

const defaultConsent = {
  moodDataConsent: true,
  behavioralDataConsent: false,
  analyticsConsent: false,
  crashReportingConsent: false,
  localStorageOnly: true,
  dataRetentionDays: 365
};

const PrivacySettings: React.FC<{ userId: string }> = ({ userId }) => {
  const [consent, setConsent] = useState(defaultConsent);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dbService.getConsentSettings(userId).then(settings => {
      if (settings) {
        setConsent({ ...defaultConsent, ...settings });
      }
      setLoading(false);
    });
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;
    setConsent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSave = async () => {
    await dbService.saveConsentSettings(userId, consent);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{textAlign:'center',margin:'2rem'}}>Loading privacy settings...</div>;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🔒 Privacy & Consent Settings</h2>
      <form>
        <label style={{display:'block',marginBottom:12}}>
          <input type="checkbox" name="moodDataConsent" checked={consent.moodDataConsent} onChange={handleChange} />
          Allow mood data collection (for local insights)
        </label>
        <label style={{display:'block',marginBottom:12}}>
          <input type="checkbox" name="behavioralDataConsent" checked={consent.behavioralDataConsent} onChange={handleChange} />
          Allow behavioral data (keystrokes, session patterns)
        </label>
        <label style={{display:'block',marginBottom:12}}>
          <input type="checkbox" name="analyticsConsent" checked={consent.analyticsConsent} onChange={handleChange} />
          Allow anonymous analytics (never sent off device)
        </label>
        <label style={{display:'block',marginBottom:12}}>
          <input type="checkbox" name="crashReportingConsent" checked={consent.crashReportingConsent} onChange={handleChange} />
          Allow crash/error reporting (never sent off device)
        </label>
        <label style={{display:'block',marginBottom:12}}>
          <input type="checkbox" name="localStorageOnly" checked={consent.localStorageOnly} onChange={handleChange} />
          Store all data locally only (never sync to cloud)
        </label>
        <label style={{display:'block',marginBottom:12}}>
          Data retention (days):
          <input type="number" name="dataRetentionDays" min={1} max={3650} value={consent.dataRetentionDays} onChange={handleChange} style={{marginLeft:8,width:80}} />
        </label>
        <button type="button" style={styles.btn} onClick={handleSave}>Save Settings</button>
        {saved && <span style={{color:'#27ae60',marginLeft:16}}>✔️ Saved!</span>}
      </form>
      <div style={{marginTop:'2rem',color:'#888',fontSize:'0.95rem',textAlign:'center'}}>
        <span>You control all your data. Nothing is ever sent off your device.</span>
      </div>
    </section>
  );
};

export default PrivacySettings;
