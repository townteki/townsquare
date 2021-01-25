const BootCost = require('./BootCost');
const CostBuilder = require('./CostBuilder');
const DiscardDuplicateCost = require('./DiscardDuplicateCost');
const DiscardFromHandCost = require('./DiscardFromHandCost');
const DiscardFromShadowsCost = require('./DiscardFromShadowsCost');
const DiscardPowerCost = require('./DiscardPowerCost');
const DiscardTokenCost = require('./DiscardTokenCost');
const AceCost = require('./AceCost');
const LowerBountyCost = require('./LowerBountyCost');
const PlaceInDeadPileFromHandCost = require('./PlaceInDeadPileFromHandCost');
const PutIntoPlayCost = require('./PutIntoPlayCost');
const PutIntoShadowsCost = require('./PutIntoShadowsCost');
const RaiseBountyCost = require('./RaiseBountyCost');
const RemoveFromChallengeCost = require('./RemoveFromChallengeCost');
const RemoveFromGameCost = require('./RemoveFromGameCost');
const ReturnToHandCost = require('./ReturnToHandCost');
const RevealCost = require('./RevealCost');
const SacrificeCost = require('./SacrificeCost');
const UnbootCost = require('./UnbootCost');

const CostBuilders = {
    discardDuplicate: new CostBuilder(new DiscardDuplicateCost(), {
        select: 'Select duplicate to discard',
        selectMultiple: number => `Select ${number} duplicates to discard`
    }),
    discardFromHand: new CostBuilder(new DiscardFromHandCost(), {
        select: 'Select card to discard from hand',
        selectMultiple: number => `Select ${number} cards to discard from hand`
    }),
    discardFromShadows: new CostBuilder(new DiscardFromShadowsCost(), {
        select: 'Select card to discard from shadows',
        selectMultiple: number => `Select ${number} cards to discard from shadows`
    }),
    discardPower: function(amount = 1) {
        return new CostBuilder(new DiscardPowerCost(amount), {
            select: `Select card to discard ${amount} power`,
            selectMultiple: number => `Select ${number} cards to discard ${amount} power`
        });
    },
    discardToken: function(token, amount = 1) {
        return new CostBuilder(new DiscardTokenCost(token, amount), {
            select: `Select card to discard ${amount} ${token}`,
            selectMultiple: number => `Select ${number} cards to discard ${amount} ${token}`
        });
    },
    ace: new CostBuilder(new AceCost(), {
        select: 'Select card to ace',
        selectMultiple: number => `Select ${number} cards to ace`
    }),
    raiseBounty: new CostBuilder(new RaiseBountyCost(), {
        select: 'Select card to raise bounty',
        selectMultiple: number => `Select ${number} cards to raise bounty`,
        selectAny: 'Select any number of cards to raise bounty'
    }),
    lowerBounty: new CostBuilder(new LowerBountyCost(), {
        select: 'Select card to lower bounty',
        selectMultiple: number => `Select ${number} cards to lower bounty`,
        selectAny: 'Select any number of cards to lower bounty'
    }),
    boot: new CostBuilder(new BootCost(), {
        select: 'Select card to kneel',
        selectMultiple: number => `Select ${number} cards to kneel`,
        selectAny: 'Select any number of cards to kneel'
    }),
    placeInDeadPileFromHand: new CostBuilder(new PlaceInDeadPileFromHandCost(), {
        select: 'Select card to place into dead pile',
        selectMultiple: number => `Select ${number} cards to place into dead pile`
    }),
    putIntoPlay: new CostBuilder(new PutIntoPlayCost(), {
        select: 'Select card to put into play',
        selectMultiple: number => `Select ${number} cards to put into play`
    }),
    putIntoShadows: new CostBuilder(new PutIntoShadowsCost(), {
        select: 'Select card to put into shadows',
        selectMultiple: number => `Select ${number} cards to put into shadows`
    }),
    removeFromChallenge: new CostBuilder(new RemoveFromChallengeCost(), {
        select: 'Select card to remove from challenge',
        selectMultiple: number => `Select ${number} cards to remove from challenge`
    }),
    removeFromGame: new CostBuilder(new RemoveFromGameCost(), {
        select: 'Select card to remove from game',
        selectMultiple: number => `Select ${number} cards to remove from game`
    }),
    returnToHand: new CostBuilder(new ReturnToHandCost(), {
        select: 'Select card to return to hand',
        selectMultiple: number => `Select ${number} cards to return to hand`
    }),
    reveal: new CostBuilder(new RevealCost(), {
        select: 'Select card to reveal',
        selectMultiple: number => `Select ${number} cards to reveal`
    }),
    sacrifice: new CostBuilder(new SacrificeCost(), {
        select: 'Select card to sacrifice',
        selectMultiple: number => `Select ${number} cards to sacrifice`,
        selectAny: 'Select any number of cards to sacrifice'
    }),
    unboot: new CostBuilder(new UnbootCost(), {
        select: 'Select card to stand',
        selectMultiple: number => `Select ${number} cards to stand`
    })
};

module.exports = CostBuilders;
