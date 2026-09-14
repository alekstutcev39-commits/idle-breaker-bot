const http = require('http');
const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

// 1. СРАЗУ ЗАПУСКАЕМ СЕРВЕР ДЛЯ RENDER
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Health Check OK');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`RENDER_CONFIRM: Server is listening on port ${PORT}`);
});

// 2. НАСТРОЙКА БОТА
const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;

if (!token) {
  console.error('ERROR: BOT_TOKEN is missing!');
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(
    '⛏️ Idle Mine Breaker ⛏️\n\nРазрушай блоки и зарабатывай!',
    Markup.keyboard([
      [Markup.button.webApp('⛏️ Играть!', webAppUrl)]
    ]).resize()
  );
});

// 3. ЗАПУСК
bot.launch().then(() => {
  console.log('TELEGRAM_CONFIRM: Bot is fully started!');
});

// Красивое завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
