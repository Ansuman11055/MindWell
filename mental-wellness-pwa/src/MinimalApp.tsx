// Step-by-step Daily Check-In Flow Component
import React, { useState, useEffect, Suspense } from 'react';
import { dbService } from './utils/database';
import { deriveKeyFromPassword, generateSalt } from './utils/encryption';
import { calculateBaseline, selectMicroIntervention, detectCrisisKeywords } from './utils/algorithms';
import { aiService, configureAI, AIResponse } from './utils/aiService';

// Lazy load large feature components from their modularized locations
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));
const CheckInFlow = React.lazy(() => import('./components/CheckInFlow'));
const Journal = React.lazy(() => import('./components/Journal'));
const MindfulnessTools = React.lazy(() => import('./components/MindfulnessTools'));
const Resources = React.lazy(() => import('./components/Resources'));
const Safety = React.lazy(() => import('./components/Safety'));
const VRExperience = React.lazy(() => import('./components/VRExperience'));
const PrivacySettings = React.lazy(() => import('./components/PrivacySettings'));

// ...existing code...

interface MoodEntry {
  mood: number;
  timestamp: string;
  note?: string;
  tags?: string[];
}

interface InterventionModule {
  id: string;
  name: string;
  description: string;
  duration: number;
  instructions: string[];
}

const MinimalApp: React.FC = () => {
  // PWA enhancements: offline detection and install prompt
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineBanner(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineBanner(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setShowOfflineBanner(true);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isInstallable, setIsInstallable] = useState(false);
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'checkin' | 'mood' | 'habits' | 'journal' | 'mindfulness' | 'progress' | 'resources' | 'safety' | 'interventions' | 'vr' | 'chat' | 'privacy'
  >('mood');

  // Safety and support features
  const panicHotline = '988';
  const [showPanic, setShowPanic] = useState(false);
  const handlePanic = () => {
    setShowPanic(true);
    setTimeout(() => setShowPanic(false), 8000);
    window.open('tel:' + panicHotline, '_blank');
  };

  // Safety component
  const Safety = () => (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🛟 Safety & Support</h2>
      <button onClick={handlePanic} style={{...styles.btn, background: '#e74c3c', fontWeight: 700, fontSize: '1.2rem', marginBottom: 24}}>🚨 Panic Button: Call 988</button>
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

  // Resources data
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

  // Resources component
  const Resources = () => (
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

  // Mindfulness tools state
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
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // MindfulnessTools component
  const MindfulnessTools = () => (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🧘 Mindfulness Tools</h2>
      {selectedTool ? (
        <div style={{maxWidth: 500, margin: '0 auto'}}>
          <button onClick={() => setSelectedTool(null)} style={{...styles.btn, marginBottom: 16}}>&larr; Back</button>
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

  // Journaling state
  const [journalEntries, setJournalEntries] = useState<{date: string, text: string}[]>([]);
  const [journalText, setJournalText] = useState('');

  // Load journal from localStorage
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

  // Journal component
  const Journal = () => (
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

  // Habit tracking state
  const [habits, setHabits] = useState<string[]>([]);
  const [habitInput, setHabitInput] = useState('');
  const [habitChecks, setHabitChecks] = useState<{ [date: string]: string[] }>({});

  // Load habits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('habits');
    if (saved) setHabits(JSON.parse(saved));
    const checks = localStorage.getItem('habitChecks');
    if (checks) setHabitChecks(JSON.parse(checks));
  }, []);

  // Save habits/checks to localStorage
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);
  useEffect(() => {
    localStorage.setItem('habitChecks', JSON.stringify(habitChecks));
  }, [habitChecks]);

  const today = new Date().toISOString().slice(0, 10);
  const handleAddHabit = () => {
    if (habitInput.trim() && !habits.includes(habitInput.trim())) {
      setHabits([...habits, habitInput.trim()]);
      setHabitInput('');
    }
  };
  const handleRemoveHabit = (habit: string) => {
    setHabits(habits.filter(h => h !== habit));
    // Remove from checks
    const updated = { ...habitChecks };
    Object.keys(updated).forEach(date => {
      updated[date] = updated[date].filter(h => h !== habit);
    });
    setHabitChecks(updated);
  };
  const handleToggleHabit = (habit: string) => {
    setHabitChecks(prev => {
      const checked = prev[today] || [];
      return {
        ...prev,
        [today]: checked.includes(habit)
          ? checked.filter(h => h !== habit)
          : [...checked, habit]
      };
    });
  };

  // HabitTracker component
  const HabitTracker = () => (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🗓️ Daily Habits</h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={habitInput}
          onChange={e => setHabitInput(e.target.value)}
          placeholder="Add a new habit (e.g., Meditate, Walk, Read)"
          style={{ ...styles.input, maxWidth: 320, display: 'inline-block', marginRight: 8 }}
        />
        <button onClick={handleAddHabit} style={styles.btn} disabled={!habitInput.trim()}>Add</button>
      </div>
      {habits.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>No habits yet. Add your first habit above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {habits.map(habit => (
            <li key={habit} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={(habitChecks[today] || []).includes(habit)}
                onChange={() => handleToggleHabit(habit)}
                style={{ marginRight: 12, width: 20, height: 20 }}
                aria-label={`Mark ${habit} as done today`}
              />
              <span style={{ flex: 1, fontSize: '1.1rem' }}>{habit}</span>
              <button onClick={() => handleRemoveHabit(habit)} style={{ ...styles.btn, background: '#e74c3c', padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '2rem', color: '#888', fontSize: '0.95rem', textAlign: 'center' }}>
        <span>Track your daily habits to build consistency and see your progress over time!</span>
      </div>
    </section>
  );
  const [moodNote, setMoodNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [baseline, setBaseline] = useState<any>(null);
  const [currentIntervention, setCurrentIntervention] = useState<InterventionModule | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'bot', timestamp: Date, confidence?: number}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [vrScene, setVrScene] = useState<'forest' | 'ocean' | 'mountain' | null>(null);
  const [aiProvider, setAiProvider] = useState<'local' | 'openai' | 'huggingface'>('local');
  const [, setApiKeyState] = useState('');
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: '#ff4757' },
    { value: 2, emoji: '😞', label: 'Sad', color: '#ff6b7a' },
    { value: 3, emoji: '😐', label: 'Neutral', color: '#ffa502' },
    { value: 4, emoji: '🙂', label: 'Happy', color: '#7bed9f' },
    { value: 5, emoji: '😄', label: 'Very Happy', color: '#2ed573' }
  ];

  const availableTags = ['work', 'family', 'health', 'sleep', 'exercise', 'social', 'stress', 'anxiety'];
  
  const interventions: InterventionModule[] = [
    {
      id: 'breathing_478',
      name: '4-7-8 Breathing',
      description: 'Calming breathing technique to reduce anxiety and stress',
      duration: 5,
      instructions: [
        'Sit comfortably with your back straight',
        'Exhale completely through your mouth',
        'Inhale through nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat 3-4 times'
      ]
    },
    {
      id: 'grounding_54321',
      name: '5-4-3-2-1 Grounding',
      description: 'Grounding technique to manage anxiety and overwhelm',
      duration: 3,
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      id: 'positive_affirmation',
      name: 'Positive Affirmations',
      description: 'Boost self-esteem and positive thinking',
      duration: 2,
      instructions: [
        'I am worthy of love and respect',
        'I have the strength to overcome challenges',
        'I choose to focus on what I can control',
        'I am growing and learning every day',
        'I deserve happiness and peace'
      ]
    }
  ];

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      const history = JSON.parse(saved);
      setMoodHistory(history);
      
      // Calculate baseline from history
      if (history.length > 0) {
        const scores = history.map((entry: MoodEntry) => entry.mood);
        const baselineData = calculateBaseline(scores);
        setBaseline(baselineData);
      }
    }

    // Check if PWA is installable
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setIsInstallable(true);
    });

    // Initialize encryption if password exists
    const hasPassword = localStorage.getItem('hasEncryption');
    if (hasPassword && !isEncrypted) {
      setShowPasswordSetup(true);
    }
  }, [isEncrypted]);

  const handleMoodSelect = async (mood: number) => {
    setCurrentMood(mood);
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          notes: moodNote,
          activities: selectedTags
        })
      });
      const data = await response.json();
      if (data.success && data.mood) {
        // Fetch updated mood history from API
        const moodsRes = await fetch('/api/mood');
        const moodsData = await moodsRes.json();
        setMoodHistory(moodsData.moods || []);
        // Update baseline
        const scores = (moodsData.moods || []).map((entry: any) => entry.mood);
        if (scores.length > 0) {
          const baselineData = calculateBaseline(scores);
          setBaseline(baselineData);
        }
      }
    } catch (error) {
      alert('Failed to save mood. Please try again.');
    }
    setMoodNote('');
    setSelectedTags([]);
  };

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = { text: chatInput, sender: 'user' as const, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    const currentInput = chatInput;
    setChatInput('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      const data = await response.json();
      const botMessage = {
        text: data.text || 'Sorry, I am having trouble responding right now.',
        sender: 'bot' as const,
        timestamp: new Date(),
        confidence: 0.9
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const fallbackMessage = {
        text: "I'm here to listen and support you. If this is urgent, please consider reaching out to a crisis helpline: 988 (US) or +91-22-27546669 (India).",
        sender: 'bot' as const,
        timestamp: new Date(),
        confidence: 0.6
      };
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const startIntervention = (intervention: InterventionModule) => {
    setCurrentIntervention(intervention);
    
    // Track intervention usage
    const recentInterventions = JSON.parse(localStorage.getItem('recentInterventions') || '[]');
    const updated = [intervention.id, ...recentInterventions.slice(0, 4)];
    localStorage.setItem('recentInterventions', JSON.stringify(updated));
  };

  const completeIntervention = () => {
    if (currentIntervention) {
      alert(`✅ Great job completing the ${currentIntervention.name} intervention!\n\nHow do you feel now? Consider logging your mood again.`);
      setCurrentIntervention(null);
      setCurrentView('mood');
    }
  };

  const setupEncryption = async () => {
    if (userPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const salt = generateSalt();
      const key = await deriveKeyFromPassword(userPassword, salt);
      dbService.setEncryptionKey(key);
      aiService.setEncryptionKey(key);
      
      localStorage.setItem('hasEncryption', 'true');
      localStorage.setItem('salt', btoa(String.fromCharCode(...salt)));
      
      setIsEncrypted(true);
      setShowPasswordSetup(false);
      setUserPassword('');
      
      alert('🔒 Encryption enabled! Your data is now secure.');
    } catch (error) {
      alert('Failed to setup encryption. Please try again.');
    }
  };

  const configureAIProvider = (provider: 'local' | 'openai' | 'huggingface', key?: string) => {
    setAiProvider(provider);
    
    if (key) {
      setApiKeyState(key);
      setIsAiConfigured(true);
      configureAI(provider, key);
      alert(`✅ ${provider.toUpperCase()} AI configured successfully!`);
    } else if (provider === 'local') {
      setIsAiConfigured(true);
      configureAI(provider);
      alert(`✅ Local AI activated! Privacy-first responses enabled.`);
    } else {
      setIsAiConfigured(true);
      configureAI(provider);
      alert(`✅ ${provider.toUpperCase()} AI configured!`);
    }
  };

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#333'
    },
    nav: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      flexWrap: 'wrap' as const
    },
    navBtn: {
      padding: '0.5rem 1rem',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '20px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    navBtnActive: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#333'
    },
    header: {
      textAlign: 'center' as const,
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    title: {
      margin: '0 0 0.5rem 0',
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2c3e50'
    },
    subtitle: {
      margin: '0 0 1rem 0',
      fontSize: '1.1rem',
      color: '#7f8c8d'
    },
    installBtn: {
      background: '#3498db',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    section: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
      color: '#2c3e50',
      fontSize: '1.5rem'
    },
    moodOptions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap' as const,
      marginBottom: '2rem'
    },
    moodBtn: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '1rem',
      background: 'white',
      border: '3px solid #ecf0f1',
      borderRadius: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '100px'
    },
    moodBtnSelected: {
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
    },
    moodEmoji: {
      fontSize: '2.5rem',
      marginBottom: '0.5rem'
    },
    moodLabel: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#2c3e50'
    },
    feedback: {
      textAlign: 'center' as const,
      padding: '1rem',
      background: '#d5f4e6',
      borderRadius: '10px',
      borderLeft: '4px solid #27ae60'
    },
    historyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #ecf0f1'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #ecf0f1',
      borderRadius: '10px',
      fontSize: '1rem',
      marginBottom: '1rem'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #ecf0f1',
      borderRadius: '10px',
      fontSize: '1rem',
      marginBottom: '1rem',
      minHeight: '100px',
      resize: 'vertical' as const
    },
    tagGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    tag: {
      padding: '0.5rem',
      border: '2px solid #ecf0f1',
      borderRadius: '20px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    tagSelected: {
      background: '#3498db',
      color: 'white',
      borderColor: '#3498db'
    },
    btn: {
      padding: '0.75rem 1.5rem',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    chatContainer: {
      height: '400px',
      overflowY: 'auto' as const,
      border: '2px solid #ecf0f1',
      borderRadius: '10px',
      padding: '1rem',
      marginBottom: '1rem'
    },
    message: {
      marginBottom: '1rem',
      padding: '0.75rem',
      borderRadius: '10px',
      maxWidth: '80%'
    },
    userMessage: {
      background: '#3498db',
      color: 'white',
      marginLeft: 'auto'
    },
    botMessage: {
      background: '#ecf0f1',
      color: '#333'
    },
    vrScene: {
      width: '100%',
      height: '400px',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative' as const
    },
    loadingDot: {
      width: '8px',
      height: '8px',
      background: '#3498db',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'
    }
  };

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Password setup modal
  if (showPasswordSetup) {
    return (
      <div style={styles.app}>
        <div style={{...styles.section, margin: '10% auto', maxWidth: '400px'}}>
          <h2 style={styles.sectionTitle}>🔒 Setup Encryption</h2>
          <p>Secure your mental health data with end-to-end encryption.</p>
          <input
            type="password"
            placeholder="Enter a secure password (8+ characters)"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            style={styles.input}
          />
          <div style={{display: 'flex', gap: '1rem'}}>
            <button onClick={setupEncryption} style={styles.btn}>
              Enable Encryption
            </button>
            <button 
              onClick={() => setShowPasswordSetup(false)} 
              style={{...styles.btn, background: '#95a5a6'}}
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '0.75rem 1.5rem',
          textAlign: 'center',
          fontWeight: 600,
          borderBottom: '2px solid #f5c6cb',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2000
        }}>
          <span>You are offline. Some features may be unavailable.</span>
          <button
            onClick={() => setShowOfflineBanner(false)}
            style={{ marginLeft: 16, background: 'none', border: 'none', color: '#721c24', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}
            aria-label="Dismiss offline banner"
          >✕</button>
        </div>
      )}
      <header style={styles.header}>
        <h1 style={styles.title}>🧠 MindWell</h1>
        <p style={styles.subtitle}>Privacy-first mental wellness tracking</p>
        {isInstallable && (
          <button onClick={handleInstallPWA} style={styles.installBtn}>
            📱 Install App
          </button>
        )}
        {isEncrypted && <span style={{color: '#27ae60', fontSize: '0.9rem'}}>🔒 Encrypted</span>}
      </header>

      {/* Navigation - Responsive */}
      <nav aria-label="Main navigation">
        <div className="main-nav-desktop" style={styles.nav}>
          {[
            {id: 'dashboard', label: 'Home', icon: '🏠'},
            {id: 'checkin', label: 'Check-In', icon: '📝'},
            {id: 'mood', label: 'Mood', icon: '😊'},
            {id: 'habits', label: 'Habits', icon: '🗓️'},
            {id: 'journal', label: 'Journal', icon: '📓'},
            {id: 'mindfulness', label: 'Mindfulness', icon: '🧘'},
            {id: 'progress', label: 'Progress', icon: '📈'},
            {id: 'resources', label: 'Resources', icon: '📚'},
            {id: 'safety', label: 'Safety', icon: '🛟'},
            {id: 'interventions', label: 'Tools', icon: '🧘'},
            {id: 'chat', label: 'Chat', icon: '💬'},
            {id: 'privacy', label: 'Privacy', icon: '🔒'}
          ].map(nav => (
            <button
              key={nav.id}
              aria-label={nav.label}
              onClick={() => setCurrentView(nav.id as any)}
              style={{
                ...styles.navBtn,
                ...(currentView === nav.id ? styles.navBtnActive : {})
              }}
            >
              <span aria-hidden="true">{nav.icon}</span> {nav.label}
            </button>
          ))}
        </div>
        <div className="main-nav-mobile" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', boxShadow: '0 -2px 8px rgba(0,0,0,0.05)', zIndex: 1000, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          {[
            {id: 'dashboard', label: 'Home', icon: '🏠'},
            {id: 'checkin', label: 'Check-In', icon: '📝'},
            {id: 'mood', label: 'Mood', icon: '😊'},
            {id: 'habits', label: 'Habits', icon: '🗓️'},
            {id: 'progress', label: 'Progress', icon: '📈'},
            {id: 'resources', label: 'Resources', icon: '📚'},
            {id: 'interventions', label: 'Tools', icon: '🧘'},
            {id: 'chat', label: 'Chat', icon: '💬'},
            {id: 'privacy', label: 'Privacy', icon: '🔒'}
          ].map(nav => (
            <button
              key={nav.id}
              aria-label={nav.label}
              onClick={() => setCurrentView(nav.id as any)}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === nav.id ? '#667eea' : '#2c3e50',
                fontSize: '1.5rem',
                flex: 1,
                padding: '0.5rem 0',
                outline: 'none',
                borderRadius: '12px',
                transition: 'background 0.2s',
                ...(currentView === nav.id ? { background: '#e3f0ff' } : {})
              }}
            >
              <span aria-hidden="true">{nav.icon}</span>
            </button>
          ))}
        </div>
      </nav>

      <main style={styles.main}>
        {/* Mood Tracking View */}
        {currentView === 'checkin' && (
          <CheckInFlow
            moodOptions={moodOptions}
            availableTags={availableTags}
            onComplete={async (entry) => {
              // Save check-in as a mood entry
              try {
                const response = await fetch('/api/mood', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mood: entry.mood,
                    notes: entry.note,
                    activities: entry.tags
                  })
                });
                const data = await response.json();
                if (data.success && data.mood) {
                  const moodsRes = await fetch('/api/mood');
                  const moodsData = await moodsRes.json();
                  setMoodHistory(moodsData.moods || []);
                  const scores = (moodsData.moods || []).map((entry: any) => entry.mood);
                  if (scores.length > 0) {
                    const baselineData = calculateBaseline(scores);
                    setBaseline(baselineData);
                  }
                }
                setCurrentView('dashboard');
              } catch (error) {
                alert('Failed to save check-in. Please try again.');
              }
            }}
          />
        )}

        {currentView === 'mood' && (
          <>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>How are you feeling right now?</h2>
              <div style={styles.moodOptions}>
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    style={{
                      ...styles.moodBtn,
                      borderColor: option.color,
                      ...(currentMood === option.value ? styles.moodBtnSelected : {})
                    }}
                    aria-label={`Select mood: ${option.label}`}
                  >
                    <span style={styles.moodEmoji}>{option.emoji}</span>
                    <span style={styles.moodLabel}>{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Mood Note */}
              <textarea
                placeholder="Add a note about your mood (optional)..."
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                style={styles.textarea}
              />

              {/* Tags */}
              <h3>Tags (optional):</h3>
              <div style={styles.tagGrid}>
                <nav aria-label="Main navigation">
                  <div className="main-nav-desktop" style={styles.nav}>
                    {[
                      {id: 'dashboard', label: 'Home', icon: '🏠'},
                      {id: 'checkin', label: 'Check-In', icon: '📝'},
                      {id: 'mood', label: 'Mood', icon: '😊'},
                      {id: 'habits', label: 'Habits', icon: '🗓️'},
                      {id: 'journal', label: 'Journal', icon: '📓'},
                      {id: 'mindfulness', label: 'Mindfulness', icon: '🧘'},
                      {id: 'progress', label: 'Progress', icon: '📈'},
                      {id: 'resources', label: 'Resources', icon: '📚'},
                      {id: 'safety', label: 'Safety', icon: '🛟'},
                      {id: 'interventions', label: 'Tools', icon: '🧘'},
                      {id: 'chat', label: 'Chat', icon: '💬'},
                      {id: 'privacy', label: 'Privacy', icon: '🔒'}
                    ].map(nav => (
                      <button
                        key={nav.id}
                        aria-label={nav.label}
                        onClick={() => setCurrentView(nav.id as any)}
                        style={{
                          ...styles.navBtn,
                          ...(currentView === nav.id ? styles.navBtnActive : {})
                        }}
                      >
                        <span aria-hidden="true">{nav.icon}</span> {nav.label}
                      </button>
                    ))}
                  </div>
                  <div className="main-nav-mobile" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', boxShadow: '0 -2px 8px rgba(0,0,0,0.05)', zIndex: 1000, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                    {[
                      {id: 'dashboard', label: 'Home', icon: '🏠'},
                      {id: 'checkin', label: 'Check-In', icon: '📝'},
                      {id: 'mood', label: 'Mood', icon: '😊'},
                      {id: 'habits', label: 'Habits', icon: '🗓️'},
                      {id: 'progress', label: 'Progress', icon: '📈'},
                      {id: 'resources', label: 'Resources', icon: '📚'},
                      {id: 'interventions', label: 'Tools', icon: '🧘'},
                      {id: 'chat', label: 'Chat', icon: '💬'},
                      {id: 'privacy', label: 'Privacy', icon: '🔒'}
                    ].map(nav => (
                      <button
                        key={nav.id}
                        aria-label={nav.label}
                        onClick={() => setCurrentView(nav.id as any)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: currentView === nav.id ? '#667eea' : '#2c3e50',
                          fontSize: '1.5rem',
                          flex: 1,
                          padding: '0.5rem 0',
                          borderRadius: '12px',
                          transition: 'background 0.2s',
                          ...(currentView === nav.id ? { background: '#e3f0ff' } : {})
                        }}
                      >
                        <span aria-hidden="true">{nav.icon}</span>
                      </button>
                    ))}
                  </div>
                </nav>
            </div>
          </section>
          </>
        )}

        {/* Interventions View */}
        {currentView === 'interventions' && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🧘 Micro-Interventions</h2>
            {currentIntervention ? (
              <div>
                <h3>{currentIntervention.name}</h3>
                <p>{currentIntervention.description}</p>
                <p><strong>Duration:</strong> {currentIntervention.duration} minutes</p>
                <h4>Instructions:</h4>
                <ol>
                  {currentIntervention.instructions.map((instruction, index) => (
                    <li key={index} style={{marginBottom: '0.5rem'}}>{instruction}</li>
                  ))}
                </ol>
                <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                  <button onClick={completeIntervention} style={styles.btn}>
                    ✅ Complete Intervention
                  </button>
                  <button 
                    onClick={() => setCurrentIntervention(null)} 
                    style={{...styles.btn, background: '#95a5a6'}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>Choose an intervention technique to help manage stress, anxiety, or improve your mood:</p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                  {interventions.map(intervention => (
                    <div key={intervention.id} style={{padding: '1.5rem', border: '2px solid #ecf0f1', borderRadius: '15px'}}>
                      <h3>{intervention.name}</h3>
                      <p>{intervention.description}</p>
                      <p><strong>Duration:</strong> {intervention.duration} minutes</p>
                      <button 
                        onClick={() => startIntervention(intervention)} 
                        style={styles.btn}
                      >
                        Start Intervention
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* VR Scenes View */}
        {currentView === 'vr' && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🥽 VR Calming Scenes</h2>
            {vrScene ? (
              <div>
                <div style={styles.vrScene}>
                  <div style={{
                    width: '100%', 
                    height: '100%', 
                    background: vrScene === 'forest' ? 'linear-gradient(to bottom, #87CEEB, #228B22)' :
                                vrScene === 'ocean' ? 'linear-gradient(to bottom, #87CEFA, #4682B4)' :
                                'linear-gradient(to bottom, #E0E6FF, #8A2BE2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}>
                    {vrScene === 'forest' && '🌲🌳🌲 Peaceful Forest 🌲🌳🌲'}
                    {vrScene === 'ocean' && '🌊🐚🌊 Calming Ocean 🌊🐚🌊'}
                    {vrScene === 'mountain' && '🏔️⛰️🏔️ Serene Mountains 🏔️⛰️🏔️'}
                  </div>
                </div>
                <div style={{textAlign: 'center', marginTop: '1rem'}}>
                  <button 
                    onClick={() => setVrScene(null)} 
                    style={styles.btn}
                  >
                    Exit VR Scene
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>Immerse yourself in calming virtual environments. Choose a scene:</p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
                  {[
                    {id: 'forest', name: '🌲 Peaceful Forest', desc: 'Gentle swaying trees and forest sounds'},
                    {id: 'ocean', name: '🌊 Calming Ocean', desc: 'Rhythmic waves and ocean breeze'},
                    {id: 'mountain', name: '🏔️ Serene Mountains', desc: 'Majestic peaks and mountain air'}
                  ].map(scene => (
                    <div key={scene.id} style={{padding: '1.5rem', border: '2px solid #ecf0f1', borderRadius: '15px', textAlign: 'center'}}>
                      <h3>{scene.name}</h3>
                      <p>{scene.desc}</p>
                      <button 
                        onClick={() => setVrScene(scene.id as any)} 
                        style={styles.btn}
                      >
                        Enter Scene
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Habits View */}
        {currentView === 'habits' && <HabitTracker />}

        {/* Chat View */}
        {currentView === 'chat' && (
          <section style={styles.section}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h2 style={{...styles.sectionTitle, margin: 0}}>💬 AI Mental Health Support</h2>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '0.9rem', color: aiProvider === 'local' ? '#95a5a6' : '#27ae60'}}>
                  {aiProvider === 'openai' ? '🤖 GPT-4' : aiProvider === 'huggingface' ? '🤗 HuggingFace' : '🏠 Local'}
                </span>
                {isAiConfigured && <span style={{color: '#27ae60'}}>✅</span>}
              </div>
            </div>

            {/* AI Configuration Panel */}
            <div style={{marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '10px'}}>
              <h4 style={{margin: '0 0 1rem 0'}}>AI Configuration</h4>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                <button 
                  onClick={() => configureAIProvider('local')}
                  style={{
                    ...styles.btn, 
                    background: aiProvider === 'local' ? '#3498db' : '#95a5a6',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🏠 Local (Free)
                </button>
                <button 
                  onClick={() => {
                    const key = prompt('Enter your OpenAI API key:');
                    if (key) configureAIProvider('openai', key);
                  }}
                  style={{
                    ...styles.btn, 
                    background: aiProvider === 'openai' ? '#3498db' : '#95a5a6',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🤖 OpenAI GPT-4
                </button>
                <button 
                  onClick={() => configureAIProvider('huggingface')}
                  style={{
                    ...styles.btn, 
                    background: aiProvider === 'huggingface' ? '#3498db' : '#95a5a6',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🤗 HuggingFace
                </button>
              </div>
              <p style={{fontSize: '0.8rem', color: '#666', margin: 0}}>
                <strong>Local:</strong> Privacy-first, works offline • 
                <strong>OpenAI:</strong> Advanced AI, requires API key • 
                <strong>HuggingFace:</strong> Open-source models
              </p>
            </div>

            <div style={styles.chatContainer}>
              {chatMessages.length === 0 && (
                <div style={{...styles.message, ...styles.botMessage}}>
                  <p>Hello! I'm your AI mental health support assistant. I'm here to listen and provide support. How are you feeling today?</p>
                  <small style={{opacity: 0.7}}>
                    Using: {aiProvider === 'openai' ? 'OpenAI GPT-4' : aiProvider === 'huggingface' ? 'HuggingFace AI' : 'Local AI'} • 
                    Privacy: {isEncrypted ? 'Encrypted' : 'Standard'}
                  </small>
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.message,
                    ...(message.sender === 'user' ? styles.userMessage : styles.botMessage)
                  }}
                >
                  <p style={{whiteSpace: 'pre-line'}}>{message.text}</p>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <small>{message.timestamp.toLocaleTimeString()}</small>
                    {message.confidence && message.sender === 'bot' && (
                      <small style={{opacity: 0.6}}>
                        Confidence: {(message.confidence * 100).toFixed(0)}%
                      </small>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{...styles.message, ...styles.botMessage}}>
                  <p>🤔 Thinking...</p>
                  <div style={{display: 'flex', gap: '0.25rem'}}>
                    <div style={{width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', animation: 'pulse 1.5s infinite'}}></div>
                    <div style={{width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.5s'}}></div>
                    <div style={{width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', animation: 'pulse 1.5s infinite 1s'}}></div>
                  </div>
                </div>
              )}
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                disabled={chatLoading}
                style={{
                  ...styles.input, 
                  marginBottom: 0, 
                  flex: 1,
                  opacity: chatLoading ? 0.6 : 1
                }}
              />
              <button 
                onClick={handleChatSend} 
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  ...styles.btn,
                  opacity: (chatLoading || !chatInput.trim()) ? 0.6 : 1,
                  cursor: (chatLoading || !chatInput.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {chatLoading ? '⏳' : 'Send'}
              </button>
            </div>
            <div style={{marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffc107'}}>
              <p style={{fontSize: '0.8rem', color: '#856404', margin: 0}}>
                <strong>⚠️ Important:</strong> This AI assistant provides support but is not a replacement for professional mental health care. 
                In crisis situations, please contact: <strong>988 (US)</strong> or <strong>+91-22-27546669 (India)</strong> immediately.
              </p>
            </div>
          </section>
        )}

        {/* Privacy View */}
        {currentView === 'privacy' && (
          <Suspense fallback={<div style={{textAlign:'center',margin:'2rem'}}>Loading privacy settings...</div>}>
            <PrivacySettings userId={"default-user"} />
          </Suspense>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
        <p>MindWell v2.0.0 - Your mental wellness, your data, your control</p>
        <p style={{fontSize: '0.8rem', opacity: 0.8}}>
          {moodHistory.length} mood entries • {isEncrypted ? 'Encrypted' : 'Unencrypted'} • 
          {baseline ? ` Baseline: ${baseline.rollingMean.toFixed(1)}` : ' Building baseline...'}
        </p>
      </footer>
    </div>
  );
};

export default MinimalApp;
