require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const http = require('http'); // Добавляем этот модуль

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL;

// --- ЗАГЛУШКА ДЛЯ RENDER ---
// Создаем простейший сервер, чтобы Render видел, что порт занят
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running!');
}).listen(port);
// ---------------------------

bot.command('start', (ctx) => {
  ctx.reply(
    '⛏️ Idle Mine Breaker ⛏️\n\n' +
    'Запусти шахту и разрушай блоки кирками!',
    {
      ...Markup.keyboard([
        [Markup.button.webApp('⛏️ Играть!', WEBAPP_URL)]
      ]).resize()
    }
  );
});

bot.on('web_app_data', (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    ctx.reply('🏆 Заработано: ' + data.coins + ' монет!');
  } catch (e) {}
});

bot.launch();
console.log('Бот запущен на порту ' + port);
