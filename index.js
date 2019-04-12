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

const store = {
    currentBet: {
        id: null,
    },
    storedBets: {}
};

// Start screen
const startScene = new Scene('start');
startScene.enter((ctx) => {
    ctx.reply('Welcome to the 777 bot');
    if (ctx.chat.type === chaneTypeEnum.private) {
        ctx.reply('Here you can configure your bot settings.\n' +
            'Type /add_card to add you payment card.\n' +
            'Type /settings to show you settings.\n' +
            'Type /bet to create bet');
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
            store.currentBet = {
                id: +new Date(),
                betOwnerId: ctx.message.from.id,
            };
            ctx.reply('Enter bet subject');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;
        if (store.currentBet.betOwnerId === userId) {
            store.currentBet.title = ctx.message.text;

            ctx.reply('Enter bet summ');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;
        if (store.currentBet.betOwnerId === userId) {
            // TODO: add validation
            store.currentBet.sum = parseInt(ctx.message.text);

            ctx.reply('Enter bet options 1. ');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;
        if (store.currentBet.betOwnerId === userId) {
            store.currentBet.options = [];

            store.currentBet.options.push(ctx.message.text);

            ctx.reply('Enter bet option 2.');
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        const userId = ctx.message.from.id;

        if (store.currentBet.betOwnerId === userId) {
            store.currentBet.options.push(ctx.message.text);
        }

        ctx.reply(`Bet configured ${JSON.stringify(store.currentBet)} \n In chat use \n/addBet ${store.currentBet.id}\n To finish bet\n/result ${store.currentBet.id}`);
        store.storedBets[store.currentBet.id] = store.currentBet;

        ctx.scene.leave();
        leave();
    }
);

bot.command('addBet', (ctx) => {
    const betId = ctx.message.text.replace('/addBet ', '').toString();
    const stored = store.storedBets[betId];
    ctx.getChat().then((chat) => {
        stored.groupId = chat.id;
    }, (rej) => {
        throw Error(rej);
    });
    if (stored) {
        let text = `${JSON.stringify(stored.title)} - ${JSON.stringify(stored.sum)}`

        const markupOpt = stored.options.map((opt) => {
            bot.action(`${opt}`, (ctx) => {
                const currentUser = ctx.from.id;
                const currentUserChoice = ctx.update.callback_query.data;

                if (!stored.participated_paris) {
                    stored.participated_paris = [];
                }

                stored.participated_paris.push({
                    id: currentUser,
                    username: ctx.from.username,
                    choice: currentUserChoice
                });

                text = text.concat(`\n${ctx.from.first_name} bets for ${currentUserChoice}`);
                ctx.editMessageText(`${text}`, Markup.inlineKeyboard(markupOpt).extra());
            });

            return Markup.callbackButton(`${opt}`, `${opt}`)
        });
        ctx.reply(`${JSON.stringify(stored.title)} - ${JSON.stringify(stored.sum)}`, Markup.inlineKeyboard(markupOpt).extra());

    } else {
        ctx.replyWithHTML('<b>no such bet</b>')
    }
});

bot.command('result', (ctx) => {
    const betId = ctx.message.text.replace('/result ', '').toString();
    const stored = store.storedBets[betId];
    const currentUser = ctx.from.id;

    if (currentUser === stored.betOwnerId) {
        const markupOpt = stored.options.map((opt) => {
            bot.action(`result-${opt}`, (ctx) => {
                const currentUserChoice = ctx.update.callback_query.data.replace('result-', '');
                if (!stored.output) {
                    stored.output = currentUserChoice;
                    ctx.editMessageText(`The winner is: ${JSON.stringify(currentUserChoice)}`).then((res) => {
                        console.log('edit: ', res);
                    }, (rej) => {
                        console.log('rej', rej)
                    });

                    const winner = stored.participated_paris.find((participant) => {
                        if (participant.choice === stored.output) return true;
                    });

                    const winnerName = winner ? `@${winner.username}` : `No winner`;

                    bot.telegram.sendMessage(stored.groupId, `The bet was resolved by creator of Bet\nThe winner is ${winnerName}`).then((res) => {
                        // console.log(res);
                    }, (rej) => {
                        console.log('rej', rej)
                    });

                } else {
                    ctx.reply('Result already choosen').then((res) => {
                        console.log(res);
                    }, (rej) => {
                        console.log('rej:', rej);
                    });
                }
            });

            return Markup.callbackButton(`${opt}`, `result-${opt}`);
        });

        // admin select winner
        ctx.reply('select winner:', Markup.inlineKeyboard(markupOpt).extra());
    } else {
        ctx.replyWithHTML('<b>Permission denied</b>')
    }
});

const stage = new Stage([startScene, addCardSceneWizard, settingsScene, createBetWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.command('add_card', enter('addCard'));
bot.command('start', enter('start'));
bot.command('settings', enter('settings'));
bot.command('bet', (ctx) => enter('createBet')(ctx));
bot.launch();
