// const Telegraf = require('telegraf');
//
// const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4');
//
// // bot.telegram.deleteWebhook().then(() => {
// //     bot.startPolling();
// //     bot.start((ctx) => ctx.reply('Welcome'));
// //     bot.help((ctx) => ctx.reply('Send me a sticker'));
// //     bot.command('createBet', (ctx) => {
// //         console.log('AGRUMENTS', ...arguments);
// //     })
// //     bot.on('sticker', (ctx) => ctx.reply('👍'));
// //     bot.hears('hi', (ctx) => ctx.reply('Hey there'));
// // });
// //
//
// const { Composer } = Telegraf
//
//
// bot.on('poll', (ctx) => ctx.reply('Poll update'))
//
// bot.start((ctx) => ctx.telegram.sendPoll('-100500100500100', '2b|!2b', ['True', 'False']))
//
// bot.command('poll', Composer.groupChat(
//     (ctx) => ctx.replyWithPoll('2b|!2b', ['True', 'False'])
// ))
//
// bot.launch();

const Telegraf = require('telegraf')
const fetch = require('node-fetch')

// async/await example.

async function omdbSearch (query = '') {
    const apiUrl = `http://www.omdbapi.com/?s=${query}&apikey=9699cca`
    const response = await fetch(apiUrl)
    const json = await response.json()
    const posters = (json.Search && json.Search) || []
    return posters.filter(({ Poster }) => Poster && Poster.startsWith('https://')) || []
}

const bot = new Telegraf('815343171:AAE2jekFZx4xSF0XJMcIymXFxqvkjV8ecM4')

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
    const posters = await omdbSearch(inlineQuery.query)
    const results = posters.map((poster) => ({
        type: 'photo',
        id: poster.imdbID,
        caption: poster.Title,
        description: poster.Title,
        thumb_url: poster.Poster,
        photo_url: poster.Poster
    }))
    return answerInlineQuery(results)
})

bot.launch()
