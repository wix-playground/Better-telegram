const Telegraf = require('telegraf');
const LocalSession = require('telegraf-session-local');

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4');

bot.use((new LocalSession({ database: 'example_db.json' })).middleware());

bot.telegram.deleteWebhook().then(() => {

    bot.telegram.setWebhook('https://bettertelegram.herokuapp.com//secret-path', null);

    bot.startWebhook('/secret-path', null, 5000);


    bot.start((ctx) => ctx.reply('Welcome'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.command('createBet', (ctx) => {
        const payload = ctx.message.text.replace('/createBet ', '');
        const [id, outcome] = payload.split(' ');
        ctx.session[id] = {
            outcome,
        };

        console.log('payload', payload);
    });
    bot.command('listBets', (ctx) => {
        console.log('listBets');
        return ctx.reply(JSON.stringify(ctx.session));
    });
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    bot.startPolling(1000, 1000);

});

bot.launch();

