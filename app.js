const Telegraf = require('telegraf');
const LocalSession = require('telegraf-session-local');

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4');

bot.use((new LocalSession({ database: 'example_db.json' })).middleware());

bot.telegram.deleteWebhook().then(() => {
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.command('createBet', (ctx) => {
        const payload = ctx.text.replace('/createBet ', '');
        const [id, outcome] = payload.split(' ');
        ctx.session[id] = {
            outcome,
        };
    });
    bot.command('listBets', (ctx) => {
        return ctx.reply(JSON.stringify(ctx.session));
    });
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    bot.startPolling();
});

bot.launch();

