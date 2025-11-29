const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;

module.exports = async (req, res) => {
  console.log('=== WEBHOOK CALLED ===');
  console.log('Method:', req.method);
  
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS запрос для CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET запрос для проверки
  if (req.method === 'GET') {
    return res.json({ 
      status: 'Bot is running', 
      webhook: 'active',
      timestamp: new Date().toISOString() 
    });
  }
  
  // POST запрос от Telegram
  if (req.method === 'POST') {
    try {
      console.log('Telegram update received');
      
      // Мгновенно отвечаем Telegram
      res.status(200).json({ ok: true });
      
      // Обрабатываем обновление асинхронно
      const update = req.body;
      handleTelegramUpdate(update).catch(error => {
        console.error('Error handling update:', error);
      });
      
    } catch (error) {
      console.error('Error in webhook:', error);
      // Всегда возвращаем успех для Telegram
      res.status(200).json({ ok: true });
    }
    return;
  }
  
  // Другие методы
  return res.status(405).json({ error: 'Method not allowed' });
};

// Обработка обновлений Telegram
async function handleTelegramUpdate(update) {
  console.log('Processing update:', JSON.stringify(update));
  
  if (update.message) {
    await handleMessage(update.message);
  } else if (update.callback_query) {
    await handleCallback(update.callback_query);
  }
}

// Обработка сообщений
async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';

  console.log(`📨 Message from ${chatId}: "${text}"`);

  try {
    if (text === '/start' || text.startsWith('/start')) {
      await sendMessage(chatId, 
        '🎮 Бот для статистики "Шепот за стеной"!\n\n' +
        'Используйте команды:\n' +
        '/game - начать запись игры\n' +
        '/ping - проверить работу бота'
      );
    } else if (text === '/game' || text === '/start_game') {
      await startNewGame(chatId);
    } else if (text === '/ping') {
      await sendMessage(chatId, '🏓 Pong! Бот работает на Vercel!');
    } else {
      await sendMessage(chatId, 'Используйте /game для начала записи игры');
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Начало новой игры
async function startNewGame(chatId) {
  console.log(`Starting new game for chat ${chatId}`);

  await sendMessage(chatId, 'Сколько игроков участвовало в игре?', {
    reply_markup: {
      inline_keyboard: [[
        { text: '👥 Два игрока', callback_data: 'players_2' },
        { text: '👥 Три игрока', callback_data: 'players_3' },
        { text: '👥 Четыре игрока', callback_data: 'players_4' }
      ]]
    }
  });
}

// Обработка callback от кнопок
async function handleCallback(callback) {
  const chatId = callback.message.chat.id;
  const data = callback.data;
  const callbackId = callback.id;

  console.log(`Callback from ${chatId}: ${data}`);

  try {
    // Отвечаем на callback
    await sendTelegram('answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'Обрабатываем...'
    });

    if (data.startsWith('players_')) {
      const playersCount = data.split('_')[1];
      await sendMessage(chatId, `✅ Игроков: ${playersCount}\n\nПродолжаем запись игры...`);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
  }
}

// Отправка сообщения в Telegram
async function sendMessage(chatId, text, extra = {}) {
  return sendTelegram('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    ...extra
  });
}

// Универсальная отправка в Telegram
async function sendTelegram(method, data) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ ${method} successful`);
    } else {
      console.error(`❌ ${method} failed:`, result);
    }

    return result;
  } catch (error) {
    console.error('Telegram API error:', error);
    return { ok: false, error: error.message };
  }
}
