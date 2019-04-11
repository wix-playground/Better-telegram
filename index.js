const Telegraf = require('telegraf')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
// const LocalSession = require('telegraf-session-local');

// TODO: Admin
const state = {};

const stepHandler = new Composer();
let store = {};
stepHandler.action('next', (ctx) => {
    ctx.reply('Step 2. Via inline button')
    return ctx.wizard.next()
});
stepHandler.command('next', (ctx) => {
    ctx.reply('Step 2. Via command')
    return ctx.wizard.next()
});


stepHandler.command('createBet', (ctx) => {
    console.log('createBet command', ctx);
    const titleBet = ctx.update.message.text.replace('/createBet ', '');

    const chatId = ctx.update.message.chat.id;

    if(store[chatId]) {
        store[chatId] = Object.assign(store[chatId], {
            [titleBet]: 'the winner - not ready yet'
        });
    } else {
        store[chatId] = {
            [titleBet]: 'the winner - not ready yet',
        }
    }

    ctx.reply('command create Bet');

    return ctx.wizard.next()
});

stepHandler.command('result', (ctx) => {
    console.log('result');

    ctx.reply('result', Markup.inlineKeyboard([
        Markup.selective(true),
        Markup.selective(false),
        Markup.selective(true),
    ]));


});

stepHandler.command('listBets', (ctx) => {
    console.log('listBets');
    const chatId = ctx.update.message.chat.id;
    // console.log('chatId', chatId);
    // console.log('store', store);

    ctx.reply('Your bets in this chat: ' + JSON.stringify(store[chatId]));
});

stepHandler.action('createBet', (ctx) => {
    console.log('createBet action', ctx);
    state.createBet = true;
    ctx.reply('createBet');
    return ctx.wizard.next()

});

stepHandler.action('done', (ctx) => {
    ctx.reply('Cancel');
    return ctx.scene.leave()

});

stepHandler.on('message', (ctx) => {
    console.log('message', state.createBet);
    if(state.createBet) {
        console.log('message state.createBet')
        const chatId = ctx.update.message.chat.id;
        const title = ctx.update.message.text;

        if(store[chatId]) {
            store[chatId] = Object.assign(store[chatId], {
                [title]: 'the winner - not ready yet'
            });
        } else {
            store[chatId] = {
                [title]: 'the winner - not ready yet',
            }
        }

        state.createBet = false;
        ctx.reply('created bet with subject ' + title);
    }
    return ctx.wizard.next()
});

stepHandler.use((ctx) => ctx.replyWithMarkdown('Press `createBet` button or type /createBet'))

const superWizard = new WizardScene('super-wizard',
    (ctx) => {
        ctx.reply('Step 1', Markup.inlineKeyboard([
            Markup.callbackButton('❤ Cancel', 'done'),
            Markup.callbackButton('➡️ createBet', 'createBet')
        ]).extra())
        return ctx.wizard.next()
    },
    stepHandler,
)

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([superWizard], { default: 'super-wizard' })
bot.use(session())
// bot.use((new LocalSession({ database: 'example_db.json' })).middleware());

bot.use(stage.middleware())
bot.launch()