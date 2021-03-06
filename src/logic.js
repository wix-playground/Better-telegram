const _ = require('lodash');

const paris = [];
const users = [];
const cards = [];

const bankAccount = {
    money: 0,
};

const getCard = (card_id) => {
    return _.find(cards, (card) => {
        return card.id === card_id;
    });
};
const getUser = (user_id) => {
    return _.find(users, (user) => {
        return user.id === user_id;
    });
};
const getPari = (pari_id) => {
    const currentPari = _.find(paris, (pari) => {
        return pari.id === pari_id;
    });
    return currentPari;
};

const registerCard = ({number, user_id}) => {
    cards.push({
        id: number,
        user_id,
        number,
        amount: 0
    });
};

const registerUser = ({payout_card, user_id, username}) => {
    if (getUser(user_id)) {
        throw new Error('already registered');
    }

    registerCard({number: payout_card, user_id});

    const card = getCard(payout_card);

    users.push({
        id: user_id,
        username,
        payout_card_id: card.id,
        participated_paris: [],
        money: 100,
    });
};

const createPari = ({subject, options, user_id, amount}) => {
    const now = new Date().getTime();

    const newPari = {
        id: (now + user_id).toString(),
        creation_time: now,
        subject,
        options,
        owner_id: user_id,
        amount,
        outcome: undefined,
        state: 'pending',
    };

    paris.push(newPari);
    return newPari.id;
};


const makeBet = ({user_id, pari_id, selected_option}) => {
    const user = getUser(user_id);
    const pari = getPari(pari_id);

    if (_.find(user.participated_paris, (participated_pari) => {
        return participated_pari.pari_id === pari_id;
    })) {
        throw new Error('already participating');
    }

    if (user.money < pari.amount) {
        throw new Error('Not enough money, go get a job!');
    }

    user.money = user.money - pari.amount;
    bankAccount.money = bankAccount.money + pari.amount;

    user.participated_paris.push({
        pari_id,
        selected_option,
        is_satisfied: undefined,
    });
};

const initiatePariVote = ({pari_id, outcome}) => {
    const pari = getPari(pari_id);
    pari.state = 'voting';
    pari.outcome = outcome;
};

const voteForPariOutcome = ({user_id, pari_id, is_satisfied}) => {
    const pari = getPari(pari_id);

    if (pari.state !== 'voting') {
        throw new Error('Voting period has not started/is over');
    }

    const user = getUser(user_id);

    const participated_pari = _.find(user.participated_paris, (participated_pari) => {
        return participated_pari.pari_id === pari_id;
    });

    if (!participated_pari) {
        throw new Error(`Not participating in pari ID: ${pari_id}`);
    }
    if (participated_pari.is_satisfied !== undefined) {
        throw new Error('Already voted');
    }

    participated_pari.is_satisfied = is_satisfied;

    checkForPariFinish(pari_id);
};

const makePayouts = ({pari_id}) => {
    const pari = getPari(pari_id);

    _.forEach(users, (user) => {
        const participated_pari = _.find(user.participated_paris, (participated_pari) => {
            return participated_pari.pari_id === pari_id;
        });

        if (participated_pari) {
            if (participated_pari.selected_option === pari.outcome) {
                const card = getCard(user.payout_card_id);
                bankAccount.money = bankAccount.money - pari.amount;
                card.amount += pari.amount;
            }
        }
    });
};

const finishPari = ({pari_id, is_succeeded}) => {
    if (is_succeeded) {
        makePayouts({pari_id});
    }
};

const checkForPariFinish = (pari_id) => {
    const pari = getPari(pari_id);

    let active_participants_count = 0;
    let voted_participants_count = 0;
    let satisfied_count = 0;

    _.forEach(users, (user) => {
        const participated_pari = _.find(user.participated_paris, (participated_pari) => {
            return participated_pari.pari_id === pari_id;
        });

        if (participated_pari) {
            active_participants_count++;

            if (participated_pari.is_satisfied) {
                satisfied_count++;
            }
            if (participated_pari.is_satisfied !== undefined) {
                voted_participants_count++;
            }
        }
    });

    if (satisfied_count === active_participants_count) {
        pari.state = 'succeeded';
    } else if (voted_participants_count === active_participants_count) {
        pari.state = 'failed';
    }

    if (pari.state !== 'pending') {
        finishPari({
            pari_id,
            is_succeeded: pari.state === 'succeeded'
        })
    }
};

const transferMoneyFromPayoutCard = (user_id) => {
    const user = getUser(user_id);
    const card = getCard(user.payout_card_id);
    user.money += card.amount;
    card.amount = 0;
};

const getWinner = (pari_id) => {
    const pari = getPari(pari_id);
    const winner = _.find(users, _.flow(
        _.property('participated_paris'),
        _.partialRight(_.every, {pari_id, selected_option: pari.outcome})
    ));

    return winner;
}

module.exports = {
    registerUser,
    getUser,
    createPari,
    getPari,
    makeBet,
    initiatePariVote,
    voteForPariOutcome,
    transferMoneyFromPayoutCard,
    getWinner
};

