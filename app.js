const Telegraf = require('telegraf');

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4', {
    channelMode: true,
    username: 'threeaxe_bot'
});

bot.deleteWebhook().then(() => {
    // bot.startPolling();
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));
});

