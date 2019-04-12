const _ = require('lodash');

const paris = [];
const users = [];
const bankAccount = {
  money: 0,
};

const getUser = (user_id) => {
  return _.find(users, (user) => {
    return user.id === user_id;
  });
};
const getPari = (pari_id) => {
  return _.find(paris, (pari) => {
    return pari.id === pari_id;
  });
};

const registerUser = ({payout_card, user_id}) => {
  if (getUser(user_id)) {
    throw new Error('already registered');
  }

  users.push({
    id: user_id,
    payout_card,
    participated_paris: [],
    money: 100,
  });
};

const createPari = ({subject, options, owner_id, amount}) => {
  const now = new Date().getTime();

  const newPari = {
    id: now + owner_id,
    creation_time: now,
    subject,
    options,
    owner_id,
    amount,
    outcome: undefined,
    state: 'pending',
  };

  paris.push(newPari);
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
  bankAccount.money = bankAccount + pari.amount;

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

  checkForPariFinish();
};

const makePayouts = ({pari_id}) => {
  const pari = getPari(pari_id);

  _.forEach(users, (user) => {
    const participated_pari = _.find(user.participated_paris, (participated_pari) => {
      return participated_pari.pari_id === pari_id;
    });

    if (participated_pari) {
      if (participated_pari.selected_option === pari.outcome) {
        user.money = user.money + pari.amount;
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

  if (satisfied_count === voted_participants_count) {
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

module.exports = {
  registerUser,
  createPari,
  makeBet,
  initiatePariVote,
  voteForPariOutcome
};

