const _ = require('lodash');
const { DevilJokerCodes, HereticJokerCodes } = require('./Constants');

const Suits = ['Clubs', 'Diams', 'Hearts', 'Spades'];
const defaultHandRank = {rank : 0, rankName: '', jokerMod: 0 };

/**
 * Class to evaluate hand rank from a hand of cards.
 */
class HandResult {
    constructor(hand, doLowest) {
        this.handRank = defaultHandRank;
        if(!hand || !_.isArray(hand)) {
            return;
        }

        this.pokerHands = new PokerHands(hand, doLowest);
        this.possibleHands = _.filter(this.pokerHands.allHandRanks, (hr) => (hr.rank !== undefined));
        let bestRank = _.orderBy(this.possibleHands, 'rank', 'desc');
        this.handRank = (bestRank[0] ? bestRank[0] : defaultHandRank);
        if(this.handRank.tiebreakerHighCards) {
            if(doLowest && this.pokerHands.jokers > 0) {
                for(let i = 1; i <= 13; i++) {
                    if(!hand.find(card => card.value === i)) {
                        this.handRank.tiebreakerHighCards.push(i);
                        this.pokerHands.jokers--;
                        if(this.pokerHands.jokers === 0) {
                            break;
                        }
                    }
                }
            }
            this.handRank.tiebreakerHighCards.sort((a, b) => b - a);
        } else {
            this.handRank.tiebreakerHighCards = [];
        }
        this.checkSpecialJokers(hand);
    }

    getHandRank() {
        return this.handRank;
    }

    checkSpecialJokers(hand) {
        this.handRank.jokerMod = 0;
        let cheatnessCake = true;
        hand.forEach(card => {
            if(DevilJokerCodes.includes(card.code)) {
                this.handRank.specialJoker = card;
                this.handRank.jokerMod += 2;
                this.handRank.cheatin = cheatnessCake;
            }
            if(HereticJokerCodes.includes(card.code)) {
                this.handRank.specialJoker = card;
                this.handRank.jokerMod -= 3;
                this.handRank.cheatin = false;
                cheatnessCake = false;
            }
        });
    }
}

class PokerHands {
    constructor(hand, doLowest) {
        this.jokers = 0;
        let strippedHand = [];

        hand.forEach(card => {
            if(card.getType() === 'joker') {
                this.jokers++;
            }

            strippedHand.push({uuid: card.uuid, value: card.value, suit: card.suit, type: card.type});
        });

        let orderedHand = _.orderBy(strippedHand, 'value', 'desc');

        this.allHandRanks = [];
        this.allHandRanks.push(new DeadMansHand(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new FiveOfAKind(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new StraightFlush(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new FourOfAKind(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new FullHouse(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new Flush(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new Straight(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new ThreeOfAKind(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new TwoPair(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new OnePair(orderedHand, doLowest ? 0 : this.jokers));
        this.allHandRanks.push(new HighCard(orderedHand));
    }

    static isCheatin(matches) {
        while(matches.length > 1) {
            let card = matches.pop();
            let cheatin = matches.some(matchCard => {
                return matchCard.value === card.value && matchCard.suit === card.suit;
            });
            if(cheatin) {
                return true;
            }
        }
        return false;    
    }
}

class DeadMansHand {
    constructor(hand, jokers) {
        let dmh = [{value: 1, suit: 'Spades'},
            {value: 1, suit: 'Clubs'},
            {value: 8, suit: 'Spades'},
            {value: 8, suit: 'Clubs'},
            {value: 11, suit: 'Diams'}];

        this.matches = _.intersectionWith(dmh, hand, (left, right) => {
            return ((left.value === right.value) && (left.suit === right.suit));
        });

        if((this.matches.length + jokers) >= 5) {
            this.rank = 11;
            this.rankName = 'Dead Man\'s Hand';
            this.rankShortName = 'DMH';
            this.cheatin = false;
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
                this.cheatin = PokerHands.isCheatin(this.matches);
            }
        }
    }
}

class StraightFlush {
    constructor(hand, jokers) {
        Suits.forEach((suit) => {
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
                    this.cheatin = false;
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
                this.tiebreakerHighCards = hand.map(card => card.value).filter(value => value && value !== i);
                this.cheatin = PokerHands.isCheatin(this.matches);
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
                        this.matches = matches3.concat(matches2);

                        if((this.matches.length + jokers) >= 5) {
                            this.rank = 7;
                            this.rankName = 'Full House';
                            this.rankShortName = 'FH';
                            this.tiebreaker = i > j ? [i, j] : [j, i];
                            this.cheatin = PokerHands.isCheatin(this.matches);
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
        Suits.forEach((suit) => {
            this.matches = _.filter(hand, (card) => {
                return card.suit === suit;
            });

            if((this.matches.length + jokers) >= 5) {
                this.rank = 6;
                this.rankName = 'Flush';
                this.rankShortName = 'Fl';
                this.tiebreaker = hand.map(card => card.value);
                this.cheatin = PokerHands.isCheatin(this.matches);
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
                this.cheatin = false;
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
                this.tiebreakerHighCards = hand.map(card => card.value).filter(value => value && value !== i);
                this.cheatin = PokerHands.isCheatin(this.matches);
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
                        this.matches = matchesFirst.concat(matchesSecond);

                        if((this.matches.length + jokers) >= 4) {
                            this.rank = 3;
                            this.rankName = 'Two Pair';            
                            this.rankShortName = '2P';
                            this.tiebreaker = i > j ? [i, j] : [j, i];
                            this.tiebreakerHighCards = hand.map(card => card.value).filter(value => value && value !== i && value !== j);
                            this.cheatin = PokerHands.isCheatin(this.matches);
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
                this.tiebreakerHighCards = hand.map(card => card.value).filter(value => value && value !== i);
                this.cheatin = PokerHands.isCheatin(this.matches);
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
            this.tiebreaker = hand.filter(card => card.value).map(card => card.value);
            this.cheatin = false;
        }
    }
}

module.exports = HandResult;
