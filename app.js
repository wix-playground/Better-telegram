const express = require('express');
const app = express();
const Telegraf = require('telegraf')

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4');
app.use(bot.webhookCallback('/secret-path'));
bot.telegram.setWebhook('https://https://bettertelegram.herokuapp.com/secret-path');

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(process.env.PORT || 3000);