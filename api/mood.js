let moodData = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const moodEntry = {
        id: Date.now().toString(),
        mood: req.body.mood,
        activities: req.body.activities || [],
        notes: req.body.notes || '',
        timestamp: new Date().toISOString()
      };
      moodData.push(moodEntry);
      res.status(200).json({ success: true, mood: moodEntry });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save mood data' });
    }
  } else if (req.method === 'GET') {
    try {
      res.status(200).json({ moods: [...moodData].reverse() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve mood data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
