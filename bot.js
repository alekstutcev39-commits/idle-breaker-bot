require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL;

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
console.log('Бот запущен!');