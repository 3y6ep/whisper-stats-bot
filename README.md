# Whisper Stats Bot

Telegram бот для сбора статистики по настольной игре "Шепот за стеной".

## Развертывание на Netlify

1. **Подключите репозиторий к Netlify**
   - В Netlify: Add new site → Import from Git → Выберите этот репозиторий

2. **Добавьте переменные окружения**
   - В Netlify: Site settings → Environment variables
   - Добавьте:
     - `BOT_TOKEN` - токен вашего Telegram бота
     - `SHEET_ID` - ID вашей Google таблицы

3. **Настройте вебхук**
   - После деплоя получите URL вашего сайта Netlify
   - Установите вебхук: 
     ```
     https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<your-site>.netlify.app/.netlify/functions/bot
     ```

## Команды бота

- `/start` - начать работу
- `/game` - записать новую игру
- `/stats` - посмотреть статистику
- `/ping` - проверить работу бота

## Локальная разработка

```bash
npm install
netlify dev