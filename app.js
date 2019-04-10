const Telegraf = require('telegraf');

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4');

bot.telegram.deleteWebhook().then(() => {
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.command('createBet', (ctx) => {
        console.log('AGRUMENTS', ...arguments);
        console.log('CTX', ctx);
    });
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    bot.startPolling();
});

bot.launch();

