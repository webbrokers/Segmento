# Flappy TG — React + Telegram Mini App

Готовый шаблон игры Flappy Bird на **React (Vite)**, адаптированный под **Telegram Mini Apps**.

## 🚀 Возможности
- Canvas-игра с тач/клик управлением
- Интеграция Telegram WebApp SDK (имя пользователя, haptic feedback, resize/expand)
- Локальный рекорд (LocalStorage)
- Меню → Игра → Game Over → Restart
- Респонсив под вебвью Telegram (safe-area)

## ▶️ Локальный запуск
```bash
npm i
npm run dev
# откроется http://localhost:5173
```

> Внутри обычного браузера всё работает. Внутри Telegram WebApp хаптики и тема подтянутся автоматически.

## ☁️ Деплой (Vercel, Netlify, GitHub Pages)
**Vercel (рекомендую):**
1. Создай репозиторий на GitHub и запушь проект.
2. Подключи репозиторий на https://vercel.com → Deploy.
3. Получишь `https://your-app.vercel.app` (HTTPS готов).

**GitHub Pages (статично):**
1. В `Settings → Pages` выбери ветку `gh-pages` (или используй `vite-plugin-gh-pages`).
2. Опубликуй билд `dist`.

## 🤖 Телеграм-бот и Mini App
1. Открой **@BotFather**:
   - `/newbot` → получи `BOT_TOKEN`
   - `/setdomain` → укажи домен мини-приложения (например, `https://your-app.vercel.app`)
2. Добавь кнопку для открытия мини-приложения:
   - Если используешь Node + `node-telegram-bot-api`:
     ```js
     bot.onText(/\/start/, (msg) => {
       bot.sendMessage(msg.chat.id, "Жми играть 🚀", {
         reply_markup: {
           inline_keyboard: [[
             { text: "Играть", web_app: { url: "https://your-app.vercel.app" } }
           ]]
         }
       });
     });
     ```
3. Открой бота, нажми **Играть** → игра откроется внутри Telegram.

## 🔌 Интеграция Telegram WebApp внутри проекта
- Инициализация: `src/telegram.js`
- Использование в `src/App.jsx` (имя пользователя, готовность SDK, расширение webview)
- Хаптики при «взмахе» птицы (если доступны)

## 🧩 Где править игру
- Логика/отрисовка — `src/game/GameCanvas.jsx`
- Игровой цикл — `src/hooks/useGameLoop.js`
- Telegram-утилиты — `src/telegram.js`

## 🏆 Таблица рекордов (опционально)
- Добавь бэкенд (например, Cloud Functions / Supabase / Firebase)
- Отправляй результат вместе с `Telegram.WebApp.initData` подписью для верификации
- В UI выведи топ-10 игроков

## 🛡️ Подсказки по публикации
- Обязательно HTTPS
- Проверь, что `https://telegram.org/js/telegram-web-app.js` доступен
- В `index.html` уже подключён SDK

Удачного запуска! Если нужно — помогу подключить лидерборд и анти-чит.
