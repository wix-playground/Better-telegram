// const Telegraf = require('telegraf');
// const LocalSession = require('telegraf-session-local');
//
// const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4');
//
// bot.use((new LocalSession({ database: 'example_db.json' })).middleware());
//
// bot.telegram.deleteWebhook().then(() => {
//
//     bot.telegram.setWebhook('https://bettertelegram.herokuapp.com//secret-path', null);
//
//     bot.startWebhook('/secret-path', null, 5000);
//
//
//     bot.start((ctx) => ctx.reply('Welcome'));
//     bot.help((ctx) => ctx.reply('Send me a sticker'));
//     bot.command('createBet', (ctx) => {
//         const payload = ctx.message.text.replace('/createBet ', '');
//         const [id, outcome] = payload.split(' ');
//         ctx.session[id] = {
//             outcome,
//         };
//
//         console.log('payload', payload);
//     });
//     bot.command('listBets', (ctx) => {
//         console.log('listBets');
//         return ctx.reply(JSON.stringify(ctx.session));
//     });
//     bot.on('sticker', (ctx) => ctx.reply('👍'));
//     bot.hears('hi', (ctx) => ctx.reply('Hey there'));
//     bot.startPolling(1000, 1000);
//
// });
//
// bot.launch();

const TBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// const LocalSession = require('telegraf-session-local');

const telegram = new TBot('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4', { polling: true });

app.set('port', (process.env.PORT || 5000));

const object = {};

app.get('/', function (req, res) {
    res.send('Nothing is here');
    res.end();
});

function onMessage(message) {
    const { text, from } = message;
    console.log('-----------');
    console.log(`Got a message "${text}" from ${from.first_name} ${from.last_name}`);

    const commandCreate = text.startsWith('/createBet');
    const commandList = text.startsWith('/listBets');

    if(commandCreate) {
        const payload = ctx.message.text.replace('/createBet ', '');
        const [id, outcome] = payload.split(' ');
        object[id] = {
            outcome,
        };

        console.log('payload', payload);
        telegram.sendMessage('Done');
    }

    if(commandList) {
        console.log('listBets');
        telegram.sendMessage(JSON.stringify(object));
    }

}

function onInlineQuery(query) {
    console.log('inline',query);

    // const searchTerm = query.query.trim();
    // if (searchTerm.length < 3) { return; }
    // searchPokemons(searchTerm)
    //     .then((items) => {
    //         const result = items.slice(0, 10).map((item) => {
    //             return {
    //                 type: 'article',
    //                 id: item.name,
    //                 title: item.name,
    //                 input_message_content: {
    //                     message_text: `/pokemon_${item.name}`
    //                 }
    //             }
    //         });
    //         telegram.answerInlineQuery(query.id, result);
    //     });

    telegram.answerInlineQuery(query.id, query);
}

telegram.on('text', onMessage);
telegram.on('command', () => {
    console.log('command');
});

telegram.on('edited_message', onMessage);
telegram.on('inline_query', onInlineQuery);

app.listen(app.get('port'), function () {
    console.log('app is running on port', app.get('port'));
});

