// Simple test webhook to debug issues
export default async function handler(req, res) {
  console.log('🔍 Test webhook called');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Environment variables:');
  console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
  console.log('- NODE_ENV:', process.env.NODE_ENV);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // Log the incoming update
    console.log('📨 Received update:', JSON.stringify(body, null, 2));

    // If it's a message, try to respond
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const user = body.message.from;
      
      console.log(`💬 Message from ${user.first_name}: "${text}"`);
      
      // Try to send a simple response
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
        return res.status(500).json({ error: 'Bot token not configured' });
      }

      const responseText = `🤖 Test response! You said: "${text}"`;
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText
        })
      });

      const result = await response.json();
      console.log('📤 Send message result:', result);
      
      if (!result.ok) {
        console.error('❌ Failed to send message:', result.description);
      }
    }

    res.status(200).json({ 
      ok: true, 
      message: 'Test webhook processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}