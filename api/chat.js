let chatHistory = [];

function getBotResponse(message) {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety')) {
    return "I understand you're feeling anxious. Try taking slow, deep breaths. Would you like me to guide you through a breathing exercise?";
  }
  if (lowerMsg.includes('sad') || lowerMsg.includes('depressed')) {
    return "I hear that you're feeling down. Your feelings are valid. What's one small thing that usually brings you comfort?";
  }
  if (lowerMsg.includes('stress')) {
    return "Stress can be overwhelming. Let's break it down - what's the main thing causing you stress right now?";
  }
  if (lowerMsg.includes('good') || lowerMsg.includes('happy')) {
    return "That's wonderful to hear! It's important to celebrate the good moments. What made today special?";
  }
  return "I'm here to listen and support you. Can you tell me more about what's on your mind?";
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const userMessage = req.body.message;
      const userId = req.body.user_id || 'anonymous';
      const botResponse = {
        text: getBotResponse(userMessage),
        timestamp: new Date().toISOString()
      };
      chatHistory.push({
        userId,
        userMessage,
        botResponse: botResponse.text,
        timestamp: botResponse.timestamp
      });
      res.status(200).json(botResponse);
    } catch (error) {
      res.status(200).json({
        text: "I'm experiencing some technical difficulties, but I'm here to help.",
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
