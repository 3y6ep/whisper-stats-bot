const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;

module.exports = async (req, res) => {
  console.log('📨 Received:', req.method, req.url);
  
  // ВСЕГДА возвращаем 200 OK для Telegram
  res.status(200).json({ ok: true });
  
  // Только после ответа обрабатываем
  if (req.method === 'POST' && req.body) {
    try {
      console.log('Telegram update:', JSON.stringify(req.body));
      
      const update = req.body;
      
      // Простая обработка
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || '';
        
        console.log(`Message: ${text} from ${chatId}`);
        
        if (text.includes('/start')) {
          await sendMessage(chatId, '🎮 Бот запущен! Используйте /game');
        } else if (text.includes('/game')) {
          await sendMessage(chatId, 'Игра начата!');
        } else if (text.includes('/ping')) {
          await sendMessage(chatId, '🏓 Pong!');
        }
      }
      
    } catch (error) {
      console.error('Processing error:', error);
    }
  }
};

async function sendMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
    console.log('Message sent to', chatId);
  } catch (error) {
    console.error('Send error:', error);
  }
}
