const _ = require('lodash');
const { DevilJokerCodes, HereticJokerCodes } = require('./Constants');

const Suits = ['Clubs', 'Diams', 'Hearts', 'Spades'];
const defaultHandRank = {rank : 0, rankName: '', jokerMod: 0 };

/**
 * Class to evaluate hand rank from a hand of cards.
 */
class HandResult {
    constructor(hand, doLowest, forSolo = false) {
        this.handRank = defaultHandRank;
        if(!hand || !_.isArray(hand)) {
            return;
        }

        this.pokerHands = new PokerHands(hand, doLowest, forSolo);
        this.possibleHands = _.filter(this.pokerHands.allHandRanks, (hr) => (hr.rank !== undefined));
        let bestRank = _.orderBy(this.possibleHands, 'rank', 'desc');
        this.handRank = (bestRank[0] ? bestRank[0] : defaultHandRank);
        if(this.handRank.tiebreakerHighCards) {
            if(doLowest && this.pokerHands.jokers.length > 0) {
                for(let i = 1; i <= 13; i++) {
                    if(!hand.find(card => card.value === i)) {
                        this.handRank.tiebreakerHighCards.push({ 
                            card: this.pokerHands.jokers.pop(),
                            value: i
                        });
                        if(this.pokerHands.jokers.length === 0) {
                            break;
                        }
                    }
                }
            }
            this.handRank.tiebreakerHighCards.sort((a, b) => b.value - a.value);
        } else {
            this.handRank.tiebreakerHighCards = [];
        }
        if(forSolo && !doLowest && this.handRank.allHands.length > 1) {
            this.handRank = this.handRank.allHands[0];
        }
        this.checkSpecialJokers(hand);
    }

    getHandRank() {
        return this.handRank;
    }

    checkSpecialJokers(hand) {
        this.handRank.jokerMod = 0;
        hand.forEach(card => {
            if(DevilJokerCodes.includes(card.code)) {
                this.handRank.specialJoker = card;
                this.handRank.jokerMod += 2;
                this.handRank.cheatin = true;
            }
            if(HereticJokerCodes.includes(card.code)) {
                this.handRank.specialJoker = card;
                this.handRank.jokerMod -= 3;
                this.handRank.cheatin = false;
            }
        });
    }
}

class PokerHands {
    constructor(hand, doLowest, forSolo) {
        this.jokers = [];
        let strippedHand = [];

        hand.forEach(card => {
            if(card.getType() === 'joker' && !doLowest) {
                this.jokers.push(card);
            }

            strippedHand.push({uuid: card.uuid, value: card.value, suit: card.suit, type: card.type});
        });

        let orderedHand = _.orderBy(strippedHand, 'value', 'desc');

        this.allHandRanks = [];
        this.allHandRanks.push(new DeadMansHand(orderedHand, this.jokers));
        this.allHandRanks.push(new FiveOfAKind(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new StraightFlush(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new FourOfAKind(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new FullHouse(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new Flush(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new Straight(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new ThreeOfAKind(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new TwoPair(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new OnePair(orderedHand, this.jokers, forSolo));
        this.allHandRanks.push(new HighCard(orderedHand));
    }

    static isCheatin(matches) {
        let tempMatches = [...matches];
        while(tempMatches.length > 1) {
            let card = tempMatches.pop();
            let cheatin = tempMatches.some(matchCard => {
                return matchCard.value === card.value && matchCard.suit === card.suit;
            });
            if(cheatin) {
                return true;
            }
        }
        return false;    
    }

    static updateHandInfo(handRank, info, jokers, forSolo) {
        if(forSolo) {
            let nonCheatinMatches = [];
            info.matches.forEach(match => {
                if(!nonCheatinMatches.find(card => card.suit === match.suit && card.value === match.value)) {
                    nonCheatinMatches.push(match);
                }
            });
            if(nonCheatinMatches.length + jokers >= 5) {
                info.matches = nonCheatinMatches;
                info.cheatin = false;
                info.jokersUsed = (5 - nonCheatinMatches.length > 0) ? 5 - nonCheatinMatches.length : 0;
            }
            if(info.matches.length > 5) {
                info.matches.splice(5);
            }
        }
        Object.assign(handRank, info);
        if(forSolo) {
            handRank.addToAllHands(BaseHand.createFromHand(handRank));
        }
    }
}

class BaseHand {
    constructor(jokerCards, forSolo = false) {
        this.jokerCards = jokerCards;
        this.allHands = [];
        this.matches = [];
        this.forSolo = forSolo;
    }

    get cards() {
        let currentCards = this.matches;
        if(this.jokersUsed) {
            currentCards = currentCards.concat(this.jokerCards.slice(0, this.jokersUsed));
        }
        if(this.tiebreakerHighCards) {
            return currentCards.concat(this.tiebreakerHighCards.map(highCard => highCard.card));
        }
        return currentCards;
    }

    isBetterThan(hand) {
        if(this.rank > hand.rank) {
            return true;
        } else if(this.rank < hand.rank) {
            return false;
        }
        if(this.forSolo) {
            if(hand.cheatin && !this.cheatin) { 
                return true;
            } else if(!hand.cheatin && this.cheatin) {
                return false;
            }
            if(hand.jokersUsed && !this.jokersUsed) { 
                return true;
            } else if(!hand.jokersUsed && this.jokersUsed) {
                return false;
            }
        }
        if(this.tiebreaker) {
            for(let i = 0; i <= this.tiebreaker.length - 1; i++) {
                if(hand.tiebreaker[i] < this.tiebreaker[i]) {
                    return true;
                } else if(hand.tiebreaker[i] > this.tiebreaker[i]) {
                    return false;
                }
            }
        }
        if(this.tiebreakerHighCards) {
            for(let i = 0; i <= this.tiebreakerHighCards.length - 1; i++) {
                if(hand.tiebreakerHighCards[i].value < this.tiebreakerHighCards[i].value) {
                    return true;
                } if(hand.tiebreakerHighCards[i].value > this.tiebreakerHighCards[i].value) {
                    return false;
                }
            }
        }
        return false;
    }

    addToAllHands(hand) {
        let i = 0;
        for(i; i < this.allHands.length - 1; i++) {
            if(hand.isBetterThan(this.allHands[i])) {
                break;
            }
        }
        this.allHands.splice(i, 0, hand);
    }

    static createFromHand(handObject) {
        let newHand = new BaseHand(handObject.jokerCards);
        Object.assign(newHand, handObject);
        return newHand;
    }
}

class DeadMansHand extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        let dmh = [{value: 1, suit: 'Spades'},
            {value: 1, suit: 'Clubs'},
            {value: 8, suit: 'Spades'},
            {value: 8, suit: 'Clubs'},
            {value: 11, suit: 'Diams'}];

        this.matches = _.intersectionWith(dmh, hand, (left, right) => {
            return ((left.value === right.value) && (left.suit === right.suit));
        });

        if(this.matches.length + jokers >= 5) {
            this.rank = 11;
            this.rankName = 'Dead Man\'s Hand';
            this.rankShortName = 'DMH';
            this.cheatin = false;
            this.jokersUsed = (5 - this.matches.length > 0) ? 5 - this.matches.length : 0;
        }
    }
}

class FiveOfAKind extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        //Check for 5oaK, starting from the best (Ks)
        //down to the worst (As). Only return the best hand
        for(let i = 13; i > 0; i--) {
            let matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if(matches.length + jokers >= 5) {
                const handRankInfo = {
                    rank: 10,
                    rankName: 'Five of a Kind',
                    rankShortName: '5oaK',
                    tiebreaker: [i],
                    matches: matches,
                    cheatin: PokerHands.isCheatin(matches),
                    jokersUsed: (5 - matches.length > 0) ? 5 - matches.length : 0
                };
                PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                if(!forSolo) {
                    break;
                }
            }
        }
    }
}

class StraightFlush extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        Suits.forEach((suit) => {
            for(let i = 13; i > 0; i--) {
                let straightFlush = [{value: i, suit: suit},
                    {value: i - 1, suit: suit},
                    {value: i - 2, suit: suit},
                    {value: i - 3, suit: suit},
                    {value: i - 4, suit: suit}];

                let matches = _.intersectionWith(hand, straightFlush, (left, right) => {
                    return ((left.value === right.value) && (left.suit === right.suit));
                });

                if(matches.length + jokers >= 5) {
                    const handRankInfo = {
                        rank: 9,
                        rankName: 'Straight Flush',
                        rankShortName: 'SF',
                        tiebreaker: [i],
                        matches: matches,
                        cheatin: false,
                        jokersUsed: (5 - matches.length > 0) ? 5 - matches.length : 0
                    };
                    PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                    if(!forSolo) {
                        return;
                    }
                }
            }
        });
    }
}

class FourOfAKind extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        //Check for 4oaK, starting from the best (Ks, value 13)
        //down to the worst (As, value 1). Only return the best hand
        for(let i = 13; i > 0; i--) {
            let matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if(matches.length + jokers >= 4) {
                let tiebreakerHighCards = hand.filter(card => card.value && card.value !== i).slice(0, 1);
                const handRankInfo = {
                    rank: 8,
                    rankName: 'Four of a Kind',
                    rankShortName: '4oaK',
                    tiebreaker: [i],
                    tiebreakerHighCards: tiebreakerHighCards.map(card => {
                        return { card, value: card.value };
                    }),
                    matches: matches,
                    cheatin: PokerHands.isCheatin(matches),
                    jokersUsed: (4 - matches.length) > 0 ? 4 - matches.length : 0
                };
                PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                if(!forSolo) {
                    break;
                }
            }
        }
    }
}

class FullHouse extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
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
                        let matches = matches3.concat(matches2);

                        if(matches.length + jokers >= 5) {
                            const handRankInfo = {
                                rank: 7,
                                rankName: 'Full House',
                                rankShortName: 'FH',
                                tiebreaker: i > j ? [i, j] : [j, i],
                                matches: matches,
                                cheatin: PokerHands.isCheatin(matches),
                                jokersUsed: (5 - matches.length) > 0 ? 5 - matches.length : 0
                            };
                            PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                            if(!forSolo) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

class Flush extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        Suits.forEach((suit) => {
            let matches = _.filter(hand, (card) => {
                return card.suit === suit;
            });

            if(matches.length + jokers >= 5) {
                const handRankInfo = {
                    rank: 6,
                    rankName: 'Flush',
                    rankShortName: 'Fl',
                    tiebreaker: hand.map(card => card.value),
                    matches: matches,
                    cheatin: PokerHands.isCheatin(matches),
                    jokersUsed: (5 - matches.length) > 0 ? 5 - matches.length : 0
                };
                PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                if(!forSolo) {
                    return;
                }
            }
        });
    }
}

class Straight extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        for(let i = 13; i > 0; i--) {
            let straight = [{value: i},
                {value: i - 1},
                {value: i - 2},
                {value: i - 3},
                {value: i - 4}];

            let matches = _.intersectionBy(hand, straight, 'value');

            if(matches.length + jokers >= 5) {
                const handRankInfo = {
                    rank: 5,
                    rankName: 'Straight',
                    rankShortName: 'Str',
                    tiebreaker: [i],
                    matches: matches,
                    cheatin: false,
                    jokersUsed: (5 - matches.length) > 0 ? 5 - matches.length : 0
                };
                PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                if(!forSolo) {
                    break;
                }
            }
        }
    }
}

class ThreeOfAKind extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        //Check for 3oaK, starting from the best (Ks)
        //down to the worst (As). Only return the best hand
        for(let i = 13; i > 0; i--) {
            let matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if(matches.length + jokers >= 3) {
                let tiebreakerHighCards = hand.filter(card => card.value && card.value !== i).slice(0, 2);
                const handRankInfo = {
                    rank: 4,
                    rankName: 'Three of a Kind',
                    rankShortName: '3oaK',
                    tiebreaker: [i],
                    tiebreakerHighCards: tiebreakerHighCards.map(card => {
                        return { card, value: card.value };
                    }),
                    matches: matches,
                    cheatin: PokerHands.isCheatin(matches),
                    jokersUsed: (3 - matches.length) > 0 ? 3 - matches.length : 0
                };
                PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                if(!forSolo) {
                    break;
                }
            }
        }
    }
}

class TwoPair extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
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
                        let matches = matchesFirst.concat(matchesSecond);

                        if(matches.length + jokers >= 4) {
                            let tiebreakerHighCards = hand.filter(card => 
                                card.value && card.value !== i && card.value !== j).slice(0, 1);
                            const handRankInfo = {
                                rank: 3,
                                rankName: 'Two Pair',
                                rankShortName: '2P',
                                tiebreaker: i > j ? [i, j] : [j, i],
                                tiebreakerHighCards: tiebreakerHighCards.map(card => {
                                    return { card, value: card.value };
                                }),
                                matches: matches,
                                cheatin: PokerHands.isCheatin(matches),
                                jokersUsed: (4 - matches.length) > 0 ? 4 - matches.length : 0
                            };
                            PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                            if(!forSolo) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

class OnePair extends BaseHand {
    constructor(hand, jokerCards, forSolo) {
        super(jokerCards, forSolo);
        let jokers = jokerCards.length;
        //Check for 1P, starting from the best (Ks)
        //down to the worst (As). Only return the best hand
        for(let i = 13; i > 0; i--) {
            let matches = _.filter(hand, (card) => {
                return (card.value === i);
            });

            if(matches.length + jokers >= 2) {
                let tiebreakerHighCards = hand.filter(card => card.value && card.value !== i).slice(0, 3);
                const handRankInfo = {
                    rank: 2,
                    rankName: 'One Pair',
                    rankShortName: '1P',
                    tiebreaker: [i],
                    tiebreakerHighCards: tiebreakerHighCards.map(card => {
                        return { card, value: card.value };
                    }),
                    matches: matches,
                    cheatin: PokerHands.isCheatin(matches),
                    jokersUsed: (2 - matches.length) > 0 ? 2 - matches.length : 0
                };
                PokerHands.updateHandInfo(this, handRankInfo, jokers, forSolo);
                if(!forSolo) {
                    break;
                }
            }
        }
    }
}

class HighCard extends BaseHand {
    constructor(hand) {
        super();
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
