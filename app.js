const express = require('express');
const app = express();
const Telegraf = require('telegraf')

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4', {
    channelMode: true
});
app.use(bot.webhookCallback('/secret-path'));
bot.telegram.deleteWebhook().then(() => {
    bot.telegram.setWebhook('https://https://bettertelegram.herokuapp.com/secret-path');
});

bot.start((ctx, next) => {
    console.log('within middleware');
    next();
}, (ctx) => {
    console.log('within start ');
    ctx.reply('Magical World')
});

// bot.command('cast', () => {
//
// });

app.get('/', (req, res) => {
    res.send('Hello World!')
});



app.listen(process.env.PORT || 3000);