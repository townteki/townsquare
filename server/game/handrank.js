const _ = require('lodash');

/**
 * Class to evaluate hand rank from a hand of cards.
 */
/*
 const handEvaluators = [
     DeadMansHand,
     FiveOfAKind,
     StraightFlush,
     FourOfAKind,
     FullHouse,
     Flush,
     Straight,
     ThreeOfAKind,
     TwoPair,
     OnePair,
     HighCard
 ];
*/
class HandRank {
    constructor(hand) {
        if(!hand) {
            return;
        }

        if(!_.isArray(hand)) {
            return;
        }

        this.pokerHands = _.filter(new PokerHands(hand), (hr) => (hr.rank !== undefined));

        //console.log(this.pokerHands);
    }

    Rank() {
        let bestRank = _.orderBy(this.pokerHands, 'rank', 'desc');
        //console.log(bestRank);
        return (bestRank[0] ? bestRank[0] : {rank : 0, rankName: ''});
    }

}

class PokerHands {
    constructor(hand) {
        let strippedHand = [];
        let jokers = 0;

        _.each(hand, (card) => {

            //console.log(card);

            if(card.type === 'joker') {
                //console.log('joker found');
                jokers++;
            }

            strippedHand.push({uuid: card.uuid, value: card.value, suit: card.suit, type: card.type});
        });

        let orderedHand = _.orderBy(strippedHand, 'value', 'desc');

        this.DeadMansHand = new DeadMansHand(orderedHand, jokers);
        this.FiveOfAKind = new FiveOfAKind(orderedHand, jokers);
        this.StraightFlush = new StraightFlush(orderedHand, jokers);
        this.FourOfAKind = new FourOfAKind(orderedHand, jokers);
        this.FullHouse = new FullHouse(orderedHand, jokers);
        this.Flush = new Flush(orderedHand, jokers);
        this.Straight = new Straight(orderedHand, jokers);
        this.ThreeOfAKind = new ThreeOfAKind(orderedHand, jokers);
        this.TwoPair = new TwoPair(orderedHand, jokers);
        this.OnePair = new OnePair(orderedHand, jokers);
        this.HighCards = new HighCard(orderedHand);
    }
}


class DeadMansHand {
    constructor(hand, jokers) {

        let dmh = [{value: 1, suit: 'spades'},
                   {value: 1, suit: 'clubs'},
                   {value: 8, suit: 'spades'},
                   {value: 8, suit: 'clubs'},
                   {value: 11, suit: 'diamonds'}];

        this.matches = _.intersectionWith(dmh, hand, (left, right) => {
            return ((left.value === right.value) && (left.suit === right.suit));
        });

        if((this.matches.length + jokers) >= 5) {
            this.rank = 11;
            this.rankName = 'Dead Man\'s Hand';
            this.rankShortName = 'DMH';
        }
    }
}

class FiveOfAKind {
    constructor(hand, jokers) {

        //Check for 5oaK, starting from the best (Ks)
        //down to the worst (As). Only return the best hand
        for(let i = 13; i > 0; i--) {
            this.matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if((this.matches.length + jokers) >= 5) {
                this.rank = 10;
                this.rankName = 'Five of a Kind';
                this.rankShortName = '5oaK';
                this.tiebreaker = [i];
            }
        }
    }
}

class StraightFlush {
    constructor(hand, jokers) {

        let suits = ['clubs', 'diamonds', 'hearts', 'spades'];

        suits.forEach((suit) => {
            for(let i = 13; i > 0; i--) {
                let straightFlush = [{value: i, suit: suit},
                                     {value: i - 1, suit: suit},
                                     {value: i - 2, suit: suit},
                                     {value: i - 3, suit: suit},
                                     {value: i - 4, suit: suit}];

                this.matches = _.intersectionWith(hand, straightFlush, (left, right) => {
                    return ((left.value === right.value) && (left.suit === right.suit));
                });

                if((this.matches.length + jokers) >= 5) {
                    this.rank = 9;
                    this.rankName = 'Straight Flush';
                    this.rankShortName = 'SF';
                    this.tiebreaker = [i];
                }
            }
        });
    }
}

class FourOfAKind {
    constructor(hand, jokers) {
        //Check for 4oaK, starting from the best (Ks, value 13)
        //down to the worst (As, value 1). Only return the best hand
        for(let i = 13; i > 0; i--) {
            this.matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if((this.matches.length + jokers) === 4) {
                this.rank = 8;
                this.rankName = 'Four of a Kind';
                this.rankShortName = '4oaK';
                this.tiebreaker = [i];
                break;
            }
        }
    }
}


class FullHouse {
    constructor(hand, jokers) {

        let matches3, matches2;

        for(let i = 13; i > 0; i--) {
            matches3 = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if(matches3.length + jokers >= 3) {

                for(let j = 13; j > 0; j--) {
                    matches2 = _.filter(hand, (card) => {
                        if(j !== i) {
                            return (card.value === j);
                        }
                    });

                    if(matches2.length + jokers >= 2) {

                        this.matches = matches3 + matches2;

                        if((this.matches.length + jokers) >= 5) {
                            this.rank = 7;
                            this.rankName = 'Full House';
                            this.rankShortName = 'FH';
                            this.tiebreaker = [i, j];
                            break;
                        }
                    }
                }
            }
        }
    }
}

class Flush {
    constructor(hand, jokers) {

        let suits = ['clubs', 'diamonds', 'hearts', 'spades'];

        suits.forEach((suit) => {
            this.matches = _.filter(hand, (card) => {
                return card.suit === suit;
            });

            if((this.matches.length + jokers) >= 5) {
                this.rank = 6;
                this.rankName = 'Flush';
                this.rankShortName = 'Fl';
                this.tiebreaker = hand;
                return;
            }

        });
    }
}

class Straight {
    constructor(hand, jokers) {
        for(let i = 13; i > 0; i--) {
            let straight = [{value: i},
                            {value: i - 1},
                            {value: i - 2},
                            {value: i - 3},
                            {value: i - 4}];

            this.matches = _.intersectionBy(hand, straight, 'value');

            if((this.matches.length + jokers) >= 5) {
                this.rank = 5;
                this.rankName = 'Straight';
                this.rankShortName = 'Str';
                this.tiebreaker = [i];
                break;
            }
        }
    }
}

class ThreeOfAKind {
    constructor(hand, jokers) {
        //Check for 3oaK, starting from the best (Ks)
        //down to the worst (As). Only return the best hand
        for(let i = 13; i > 0; i--) {
            this.matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if((this.matches.length + jokers) === 3) {
                this.rank = 4;
                this.rankName = 'Three of a Kind';
                this.rankShortName = '3oaK';
                this.tiebreaker = [i];
                break;
            }
        }
    }
}

class TwoPair {
    constructor(hand, jokers) {

        let matchesFirst, matchesSecond;

        for(let i = 13; i > 0; i--) {
            matchesFirst = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if(matchesFirst.length + jokers >= 2) {

                for(let j = 13; j > 0; j--) {
                    matchesSecond = _.filter(hand, (card) => {
                        if(j !== i) {
                            return (card.value === j);
                        }
                    });

                    if(matchesSecond.length + jokers >= 2) {

                        this.matches = matchesFirst + matchesSecond;

                        if((this.matches.length + jokers) >= 5) {
                            this.rank = 3;
                            this.rankName = 'Two Pair';            
                            this.rankShortName = '2P';
                            this.tiebreaker = [i,j];
                            break;
                        }
                    }
                }
            }
        }
    }
}

class OnePair {
    constructor(hand, jokers) {
        //Check for 1P, starting from the best (Ks)
        //down to the worst (As). Only return the best hand
        for(let i = 13; i > 0; i--) {
            this.matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if((this.matches.length + jokers) === 2) {
                this.rank = 2;
                this.rankName = 'One Pair';
                this.rankShortName = '1P';
                this.tiebreaker = [i];
                break;
            }
        }
    }
}

class HighCard {
    constructor(hand) {
        this.matches = _.take(hand, 5);

        if(this.matches.length > 0) {
            this.rank = 1;
            this.rankName = 'High Card';
            this.rankShortName = 'Hi';
            this.tiebreaker = hand;
        }
    }
}

module.exports = HandRank;
