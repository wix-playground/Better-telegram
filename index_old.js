const Telegraf = require('telegraf');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');


// TODO: Admin
const state = {};
//
// const stepHandler = new Composer();
let store = {};
//
// stepHandler.action('next', (ctx) => {
//     ctx.reply('Step 2. Via inline button')
//     return ctx.wizard.next()
// });
// stepHandler.command('next', (ctx) => {
//     ctx.reply('Step 2. Via command')
//     return ctx.wizard.next()
// });

//
// stepHandler.command('createBet', (ctx) => {
//     console.log('createBet command', ctx);
//     const titleBet = ctx.update.message.text.replace('/createBet ', '');
//
//     const chatId = ctx.update.message.chat.id;
//
//     if(store[chatId]) {
//         store[chatId] = Object.assign(store[chatId], {
//             [titleBet]: 'the winner - not ready yet'
//         });
//     } else {
//         store[chatId] = {
//             [titleBet]: 'the winner - not ready yet',
//         }
//     }
//
//     ctx.reply('command create Bet');
//
//     return ctx.wizard.next()
// });

// stepHandler.command('result', (ctx) => {
//     console.log('result');
//
//     ctx.reply('result', Markup.inlineKeyboard([
//         Markup.selective(true),
//         Markup.selective(false),
//         Markup.selective(true),
//     ]));
// });

// stepHandler.command('listBets', (ctx) => {
//     console.log('listBets');
//     const chatId = ctx.update.message.chat.id;
//     // console.log('chatId', chatId);
//     // console.log('store', store);
//
//     ctx.reply('Your bets in this chat: ' + JSON.stringify(store[chatId]));
// });

// stepHandler.action('createBet', (ctx) => {
//     // console.log('createBet action', ctx.update);
//     state.createBet = true;
//     ctx.reply('createBet');
//     // return ctx.wizard.next()
// });
//
// stepHandler.action('done', (ctx) => {
//     ctx.reply('Cancel');
//     return ctx.scene.leave()
//
// });

// stepHandler.on('message', (ctx) => {
//     console.log('message', state.createBet);
//     if(state.createBet) {
//         console.log('message state.createBet')
//         const chatId = ctx.update.message.chat.id;
//         const title = ctx.update.message.text;
//
//         if(store[chatId]) {
//             store[chatId] = Object.assign(store[chatId], {
//                 [title]: 'the winner - not ready yet'
//             });
//         } else {
//             store[chatId] = {
//                 [title]: 'the winner - not ready yet',
//             }
//         }
//
//         state.createBet = false;
//         ctx.reply('created bet with subject ' + title);
//     }
//     return ctx.wizard.next()
// });

// stepHandler.use((ctx) => ctx.replyWithMarkdown('Press `createBet` button or type /createBet'))


// const superWizard = new WizardScene('super-wizard',
//     (ctx) => {
//         ctx.reply('Step 1', Markup.inlineKeyboard([
//             Markup.callbackButton('❤ Cancel', 'done'),
//             Markup.callbackButton('➡️ createBet', 'createBet')
//         ]).extra());
//         return ctx.wizard.next();
//     },
//     stepHandler,
//     (ctx) => {
//         // state.createBet === ctx.update.message.text;
//         console.log('update', ctx.update);
//
//         return ctx.wizard.next()
//     },
//     () => stepHandler.on('message')
// );
//
// superWizard.on('text', (ctx) => {
//     console.log('handler wizard on');
// });

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('register', (ctx) => {
    console.log('RRRR');
    ctx.getChatMembersCount().then((res)=> {
        if (res > 2) {
            ctx.reply(`Can't make registry in a group chat, go to https://t.me/threeaxe_bot`);
        } else {
            state.register = true;
            ctx.reply('Registration');
        }
    }, (rej) => {
        console.log('rejected!!!', rej)
    });
});


bot.command('addCard', (ctx) => {
    console.log('addCard');
});

bot.on('text', (ctx) => {
    if
      });




bot.help((ctx) => {
    ctx.reply(`
        /register \n
        /createPari \n
        /doBet \n
    `)
});

// const stage = new Stage([superWizard], { default: 'super-wizard' })
// bot.use(session());
// bot.use(stage.middleware())
bot.launch()
