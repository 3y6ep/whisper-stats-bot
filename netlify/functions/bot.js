import fetch from 'node-fetch';
import { google } from 'googleapis';

const BOT_TOKEN = process.env.BOT_TOKEN;
const SHEET_ID = process.env.SHEET_ID;

// Обработчик вебхука для Netlify
export async function handler(event) {
  console.log('=== WEBHOOK CALLED ===');
  
  // Мгновенный ответ для Telegram
  const response = {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };

  try {
    if (event.body) {
      const update = JSON.parse(event.body);
      console.log('Update received:', JSON.stringify(update));
      
      // Асинхронная обработка
      handleUpdate(update).catch(error => {
        console.error('Error in async handling:', error);
      });
    }
  } catch (error) {
    console.error('Error parsing update:', error);
  }

  return response;
}

// Основная обработка обновлений
async function handleUpdate(update) {
  if (update.message) {
    await handleMessage(update.message);
  } else if (update.callback_query) {
    await handleCallback(update.callback_query);
  }
}

// Обработка текстовых сообщений
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
        '/stats - посмотреть статистику\n' +
        '/ping - проверить работу бота'
      );
    } else if (text === '/game' || text === '/start_game') {
      await startNewGame(chatId);
    } else if (text === '/ping') {
      await sendMessage(chatId, '🏓 Pong! Бот работает на Netlify!');
    } else if (text === '/stats') {
      await sendMessage(chatId, '📊 Статистика будет доступна после записи первых игр');
    } else {
      await sendMessage(chatId, 'Используйте /game для начала записи игры');
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await sendMessage(chatId, '❌ Произошла ошибка при обработке команды');
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
      await handlePlayersCount(chatId, playersCount);
    } else if (data.startsWith('map_')) {
      const parts = data.split('_');
      const map = parts[1];
      const playersCount = parts[2];
      await handleMapSelection(chatId, map, playersCount);
    } else if (data.startsWith('killer_')) {
      const parts = data.split('_');
      const killer = parts[1];
      const map = parts[2];
      const playersCount = parts[3];
      await handleKillerSelection(chatId, killer, map, playersCount);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
  }
}

// Обработка выбора количества игроков
async function handlePlayersCount(chatId, playersCount) {
  await sendMessage(chatId, `✅ Игроков: ${playersCount}\n\nВыберите карту:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏠 Особняк', callback_data: `map_Особняк_${playersCount}` }],
        [{ text: '🏚️ Охотничий домик', callback_data: `map_Охотничий домик_${playersCount}` }],
        [{ text: '🔬 Лаборатория', callback_data: `map_Лаборатория_${playersCount}` }],
        [{ text: '🏰 Замок', callback_data: `map_Замок_${playersCount}` }],
        [{ text: '⚰️ Гробница', callback_data: `map_Гробница_${playersCount}` }]
      ]
    }
  });
}

// Обработка выбора карты
async function handleMapSelection(chatId, map, playersCount) {
  await sendMessage(chatId, `✅ Карта: ${map}\n\nВыберите убийцу:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔪 Мясник', callback_data: `killer_Мясник_${map}_${playersCount}` }],
        [{ text: '👻 Призрак', callback_data: `killer_Призрак_${map}_${playersCount}` }],
        [{ text: '🔪 Маньяк', callback_data: `killer_Маньяк_${map}_${playersCount}` }],
        [{ text: '🗿 Каменные войны', callback_data: `killer_Каменные войны_${map}_${playersCount}` }],
        [{ text: '🐺 Оборотень', callback_data: `killer_Оборотень_${map}_${playersCount}` }],
        [{ text: '🏹 Охотница', callback_data: `killer_Охотница_${map}_${playersCount}` }],
        [{ text: '👹 Пожиратель', callback_data: `killer_Пожиратель_${map}_${playersCount}` }],
        [{ text: '❓ Неопознанное', callback_data: `killer_Неопознанное_${map}_${playersCount}` }],
        [{ text: '👑 Королева', callback_data: `killer_Королева_${map}_${playersCount}` }]
      ]
    }
  });
}

// Обработка выбора убийцы
async function handleKillerSelection(chatId, killer, map, playersCount) {
  await sendMessage(chatId, 
    `🎯 Игра записана!\n\n` +
    `👥 Игроков: ${playersCount}\n` +
    `🗺️ Карта: ${map}\n` +
    `🔪 Убийца: ${killer}\n\n` +
    `Данные сохранены в Google Sheets!\n\n` +
    `Используйте /game для записи следующей игры`
  );

  // Здесь будет сохранение в Google Sheets
  await saveGameToSheets({
    playersCount,
    map,
    killer,
    timestamp: new Date().toISOString()
  });
}

// Сохранение игры в Google Sheets (заглушка)
async function saveGameToSheets(gameData) {
  console.log('Saving game to sheets:', gameData);
  // Реализация сохранения в Google Sheets будет добавлена позже
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
