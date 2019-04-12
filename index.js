const Telegraf = require('telegraf');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const chaneTypeEnum = {private: 'private', group: 'group'};
const Scene = require('telegraf/scenes/base');
const {enter, leave} = Stage;

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start screen
const startScene = new Scene('start');
startScene.enter((ctx) => {
    ctx.reply('Welcome to the 777 bot');
    if (ctx.chat.type === chaneTypeEnum.private) {
        ctx.reply('Here you can configure your bot settings.\n' +
            'Type /add_card to add you payment card.\n' +
            'Type /settings to show you settings.\n');
    }
    if (ctx.chat.type === chaneTypeEnum.group) {
        ctx.reply('Hey! Hey! Hey! 777 bot in da house!');
    }
    ctx.scene.leave();
    leave();
});

// Help screen
bot.help((ctx) => ctx.reply('Here some help text.'));


// Add card screen
const addCardSceneWizard = new WizardScene('addCard',
    (ctx) => {
        if (ctx.chat.type !== chaneTypeEnum.private) {
            ctx.reply('Unknown command');
            leave();
        } else {
            ctx.reply('Please enter your payment card number:');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        // TODO: Here validate number
        ctx.session.cardNumber = ctx.message.text;

        ctx.reply('Please enter your payment card expire date [MM/YY]:');
        return ctx.wizard.next();
    },
    (ctx) => {
        // TODO: Here validate date
        ctx.session.cardExpireDate = ctx.message.text;

        ctx.reply('Please enter your payment card CVV code:');
        return ctx.wizard.next();
    },
    (ctx) => {
        // TODO: Here validate CVV
        ctx.session.cardCVV = ctx.message.text;

        ctx.reply('Card successfully added');
        ctx.scene.leave();
        leave();
    }
);


// Show settings screen
const settingsScene = new Scene('settings');
settingsScene.enter((ctx) => {
    if (ctx.chat.type !== chaneTypeEnum.private) {
        ctx.reply('Unknown command');
        ctx.scene.leave();
        leave();
    } else {
        const {cardNumber, cardExpireDate, cardCVV} = ctx.session;
        ctx.reply(`Your settings:\nCard number: ${cardNumber}\nCard expire date: ${cardExpireDate}\nCard CVV: ${cardCVV}`);
        ctx.scene.leave();
        leave();
    }
});

const createBetWizard = new WizardScene('createBet',
    (ctx) => {
        if (ctx.chat.type !== chaneTypeEnum.private) {
            ctx.reply('Unknown command');
            ctx.scene.leave();
            leave();
        } else {
            ctx.session.bet = {
                bet_owner_id: ctx.message.from.id,
            };
            ctx.reply('Enter bet subject');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;
        if (ctx.session.bet.bet_owner_id === userId) {
            ctx.session.bet.title = ctx.message.text;

            ctx.reply('Enter bet summ');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;
        if (ctx.session.bet.bet_owner_id === userId) {
            // TODO: add validation
            ctx.session.bet.summ = parseInt(ctx.message.text);

            ctx.reply('Enter bet options 1. ');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;
        if (ctx.session.bet.bet_owner_id === userId) {
            ctx.session.bet.options = [];

            ctx.session.bet.options.push(ctx.message.text);

            ctx.reply('Enter bet option 2.');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;

        if(ctx.session.bet.bet_owner_id === userId) {
            ctx.session.bet.options.push(ctx.message.text);
        }

        ctx.reply('Bet configured' + JSON.stringify(ctx.session.bet));

        ctx.scene.leave();
        leave();
    }
);


const stage = new Stage([startScene, addCardSceneWizard, settingsScene, createBetWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.command('add_card', enter('addCard'));
bot.command('start', enter('start'));
bot.command('settings', enter('settings'));
bot.command('bet', (ctx) => enter('createBet')(ctx));
bot.launch();
