const ChooseCost = require('./costs/choosecost.js');
const CostBuilders = require('./costs/CostBuilders.js');
const BootCost = require('./costs/BootCost.js');
const XValuePrompt = require('./costs/XValuePrompt.js');
const SelfCost = require('./costs/SelfCost.js');
const UnbootCost = require('./costs/UnbootCost.js');
const MoveTokenFromSelfCost = require('./costs/MoveTokenFromSelfCost.js');
const DiscardFromDeckCost = require('./costs/DiscardFromDeckCost');
const {Tokens} = require('./Constants');

const Costs = {
    /**
     * Cost that allows the player to choose between multiple costs. The
     * `choices` object should have string keys representing the button text
     * that will be used to prompt the player, with the values being the cost
     * associated with that choice.
     */
    choose: function(choices) {
        return new ChooseCost(choices);
    },
    /**
     * Cost that will boot the card that initiated the ability.
     */
    bootSelf: function() {
        let action = new BootCost();
        let unpayAction = new UnbootCost();
        return new SelfCost(action, unpayAction);
    },
    /**
     * Cost that will boot the parent card the current card is attached to.
     */
    bootParent: () => CostBuilders.boot.parent(),
    /**
     * Cost that boots a specific card passed into the function
     */
    bootSpecific: cardFunc => CostBuilders.boot.specific(cardFunc),
    /**
     * Cost that requires booting a card that matches the passed condition
     * predicate function.
     */
    boot: condition => CostBuilders.boot.select(condition),
    /**
     * Cost that requires booting a certain number of cards that match the
     * passed condition predicate function.
     */
    bootMultiple: (amount, condition) => CostBuilders.boot.selectMultiple(amount, condition),
    /**
     * Cost that requires booting any number of cards that match the
     * passed condition predicate function.
     */
    bootAny: (condition, zeroAllowed) => CostBuilders.boot.selectAny(condition, zeroAllowed),
    /**
     * Cost that will ace the card that initiated the ability.
     */
    aceSelf: () => CostBuilders.ace.self(),
    /**
     * Cost that will ace the parent card the current card is attached to.
     */
    aceParent: () => CostBuilders.ace.parent(),
    /**
     * Cost that requires acing a card that matches the passed condition
     * predicate function.
     */
    ace: condition => CostBuilders.ace.select(condition),
    /**
     * Cost that will put into play the card that initiated the ability.
     */
    putSelfIntoPlay: () => CostBuilders.putIntoPlay.self(),
    /**
     * Cost that will remove from game the card that initiated the ability.
     */
    removeSelfFromGame: () => CostBuilders.removeFromGame.self(),
    /**
     * Cost that requires you return a card matching the condition to the
     * player's hand.
     */
    returnToHand: condition => CostBuilders.returnToHand.select(condition),
    /**
     * Cost that will return to hand the card that initiated the ability.
     */
    returnSelfToHand: () => CostBuilders.returnToHand.self(),
    /**
     * Cost that will place in the dead pile from hand the card that initiated the ability.
     */
    placeSelfInDeadPileFromHand: () => CostBuilders.placeInDeadPileFromHand.self(),
    /**
     * Cost that reveals a specific card passed into the function
     */
    revealSpecific: cardFunc => CostBuilders.reveal.specific(cardFunc),
    /**
     * Cost that requires revealing a certain number of cards in hand that match
     * the passed condition predicate function.
     */
    revealCards: (number, condition) => CostBuilders.reveal.selectMultiple(number, condition),
    /**
     * Cost that will stand the card that initiated the ability (e.g.,
     * Barristan Selmy (TS)).
     */
    standSelf: () => CostBuilders.stand.self(),
    /**
     * Cost that will stand the parent card the current card is attached to.
     */
    standParent: () => CostBuilders.stand.parent(),
    /**
     * Cost that requires standing a card that matches the passed condition
     * predicate function.
     */
    stand: condition => CostBuilders.stand.select(condition),
    /**
     * Cost that will place the played event card in the player's discard pile.
     */
    expendAction: function() {
        return {
            canPay: function(context) {
                return context.player.isCardInPlayableLocation(context.source, 'play') && context.player.canPlay(context.source, 'play');
            },
            pay: function(context) {
                // Events become in a "state of being played" while they resolve
                // and are not placed in discard until after resolution / cancel
                // of their effects.
                // Ruling: http://www.cardgamedb.com/forums/index.php?/topic/35981-the-annals-of-castle-black/
                context.originalLocation = context.source.location;
                context.source.controller.moveCard(context.source, 'being played');
            }
        };
    },
    /**
     * Cost that requires discarding from hand the card that initiated the ability.
     */
    discardSelfFromHand: () => CostBuilders.discardFromHand.self(),
    /**
     * Cost that requires discarding a card from hand matching the passed
     * condition predicate function.
     */
    discardFromHand: condition => CostBuilders.discardFromHand.select(condition),
    /**
     * Cost that requires discarding multiple cards from hand matching the passed
     * condition predicate function.
     */
    discardMultipleFromHand: (number, condition) => CostBuilders.discardFromHand.selectMultiple(number, condition),
    /**
     * Cost that requires discarding the top card from the draw deck.
     */
    discardFromDeck: () => new DiscardFromDeckCost(),
    /**
     * Cost that will pay the reduceable gold cost associated with an event card
     * and place it in discard.
     */
    playAction: function() {
        return [
            Costs.payReduceableGRCost('play'),
            Costs.expendAction()
        ];
    },
    /**
     * Cost that will discard a gold from the card. Used mainly by cards
     * having the bestow keyword.
     */
    discardGold: amount => CostBuilders.discardToken('gold', amount).self(),
    /**
     * Cost that will discard a fixed amount of a passed type token from the current card.
     */
    discardTokenFromSelf: (type, amount) => CostBuilders.discardToken(type, amount).self(),
    /**
     * Cost that will move a fixed amount of a passed type token from the current card to a
     * destination card matching the passed condition predicate function.
     */
    moveTokenFromSelf: (type, amount, condition) => new MoveTokenFromSelfCost(type, amount, condition),
    /**
     * Cost that will pay the exact printed gold cost for the card.
     */
    payPrintedGoldCost: function() {
        return {
            canPay: function(context) {
                return context.player.ghostrock >= context.source.getCost();
            },
            pay: function(context) {
                context.game.spendGold({ amount: context.source.getCost(), player: context.player });
            }
        };
    },
    /**
     * Cost that will pay the printed ghostrock cost on the card minus any active
     * reducer effects the play has activated. Upon playing the card, all
     * matching reducer effects will expire, if applicable.
     */
    payReduceableGRCost: function(playingType) {
        return {
            canPay: function(context) {
                if(context.cardToUpgrade) {
                    return true;
                }
                let reducedCost = context.player.getReducedCost(playingType, context.source);
                return context.player.getSpendableGhostRock({ playingType: playingType }) >= reducedCost;
            },
            pay: function(context) {
                if(context.cardToUpgrade) {
                    return;
                }
                context.costs.ghostrock = context.player.getReducedCost(playingType, context.source);
                context.game.spendGhostRock({ amount: context.costs.ghostrock, player: context.player, playingType: playingType });
                context.player.markUsedReducers(playingType, context.source);
            }
        };
    },
    /**
     * Cost in which the player must pay a fixed, non-reduceable amount of gold.
     */
    payGhostRock: function(amount) {
        return {
            canPay: function(context) {
                return context.player.getSpendableGhostRock({ player: context.player, playingType: 'ability' }) >= amount;
            },
            pay: function(context) {
                context.game.spendGhostRock({ amount: amount, player: context.player });
            }
        };
    },
    /**
     * Reducable cost where the player gets prompted to pay from a passed minimum up to the lesser of two values:
     * the passed maximum and either the player's or his opponent's gold.
     * Used by Ritual of R'hllor, Loot, The Things I Do For Love and Melee at Bitterbridge.
     */
    payXGold: function(minFunc, maxFunc, opponentFunc) {
        return {
            canPay: function(context) {
                let reduction = context.player.getCostReduction('play', context.source);
                let opponentObj = opponentFunc && opponentFunc(context);

                if(!opponentObj) {
                    return context.player.getSpendableGold() >= (minFunc(context) - reduction);
                }
                return opponentObj.getSpendableGold() >= (minFunc(context) - reduction);
            },
            resolve: function(context, result = { resolved: false }) {
                let reduction = context.player.getCostReduction('play', context.source);
                let opponentObj = opponentFunc && opponentFunc(context);
                let gold = opponentObj ? opponentObj.getSpendableGold({ playingType: 'play' }) : context.player.getSpendableGold({ playingType: 'play' });
                let max = Math.min(maxFunc(context), gold + reduction);

                context.game.queueStep(new XValuePrompt(minFunc(context), max, context, reduction));

                result.value = true;
                result.resolved = true;
                return result;
            },
            pay: function(context) {
                let opponentObj = opponentFunc && opponentFunc(context);
                if(!opponentObj) {
                    context.game.spendGold({ player: context.player, amount: context.goldCost, playingType: 'play' });
                } else {
                    context.game.spendGold({ player: opponentObj, amount: context.goldCost, playingType: 'play' });
                }
                context.player.markUsedReducers('play', context.source);
            }
        };
    },
    /**
     * Cost where the player gets prompted to discard gold from the card from a passed minimum up to the lesser of two values:
     * the passed maximum and the amount of gold on the source card.
     * Used by The House of Black and White, Stormcrows and Devan Seaworth.
     */
    discardXGold: function(minFunc, maxFunc) {
        return {
            canPay: function(context) {
                return context.source.tokens.gold >= minFunc(context);
            },
            resolve: function(context, result = { resolved: false }) {
                let max = Math.min(maxFunc(context), context.source.tokens.gold);

                context.game.queueStep(new XValuePrompt(minFunc(context), max, context));

                result.value = true;
                result.resolved = true;
                return result;
            },
            pay: function(context) {
                context.source.modifyToken(Tokens.gold, -context.xValue);
            }
        };
    }
};

module.exports = Costs;
