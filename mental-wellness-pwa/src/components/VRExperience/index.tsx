import React, { useState } from 'react';

const styles = {
  section: { padding: '2rem', maxWidth: 600, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2c3e50' },
  btn: { padding: '0.5rem 1.2rem', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  vrScene: { width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden', position: 'relative' as const }
};

type Scene = 'forest' | 'ocean' | 'mountain' | null;

const VRExperience: React.FC = () => {
  const [vrScene, setVrScene] = useState<Scene>(null);
  return (
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
            <button onClick={() => setVrScene(null)} style={styles.btn}>Exit VR Scene</button>
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
                <button onClick={() => setVrScene(scene.id as Scene)} style={styles.btn}>Enter Scene</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default VRExperience;
