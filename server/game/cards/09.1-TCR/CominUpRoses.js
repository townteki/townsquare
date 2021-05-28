const ActionCard = require('../../actioncard.js');

class CominUpRoses extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Resolution: Change suit',
            playType: ['resolution'],
            target: {
                activePromptTitle: 'Choose a card',
                cardCondition: { 
                    condition: card => card.location === 'draw hand' && card.controller === this.controller &&
                        card.controller.drawHand.every(drawHandCard => card === drawHandCard || card.value !== drawHandCard.value) 
                },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action']
            },
            handler: context => {
                this.cardsToChange = [context.target];
                this.game.promptForSuit(context.player, `Change suit in ${context.target.value} of ${context.target.suit} to`, 'chooseSuit', this, this);
            }
        });
        this.action({
            title: 'Cheatin\' Resolution: Change suit and value',
            playType: ['cheatin resolution'],
            target: {
                activePromptTitle: 'Choose up to 2 cards',
                cardCondition: { 
                    location: 'draw hand'
                },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
                numCards: 2,
                multiSelect: true
            },
            message: context => this.game.addMessage('{0} has +2 hand rank until end of shootout while their hand contains a legal flush or straight', context.player),
            handler: context => {
                this.cheatinResContext = context;
                this.cardsToChange = context.target;
                context.target.forEach(target => {
                    this.game.promptForValue(context.player, `Change value in ${target.value} of ${target.suit} to`, 'chooseValue', this, this, 
                        (player, value) => !player.drawHand.some(card => card !== target && card.value === value));
                });
            }
        });
    }

    chooseValue(player, arg) {
        let cardToChange = this.cardsToChange[0];
        this.untilEndOfShootoutRound(ability => ({
            match: cardToChange,
            effect: ability.effects.setValue(arg, this.uuid)
        }), null, 'draw hand');
        this.game.promptForSuit(player, `Change suit in ${cardToChange.value} of ${cardToChange.suit} to`, 'chooseSuit', this, this);
        return true;
    }

    chooseSuit(player, arg) {
        let cardToChange = this.cardsToChange.shift();
        this.untilEndOfShootoutRound(ability => ({
            match: cardToChange,
            effect: ability.effects.setSuit(arg, this.uuid)
        }), null, 'draw hand');
        if(this.cheatinResContext) {
            this.game.addMessage('{0} uses {1} to change suit and value of {2} in draw hand to {3}of{4}', 
                player, this, cardToChange, cardToChange.value, arg);
        } else {
            this.game.addMessage('{0} uses {1} to change suit of {2} in draw hand to {3}', player, this, cardToChange, arg);
        }
        if(this.cardsToChange.length === 0) {
            player.determineHandResult('changes hand to');
            if(this.cheatinResContext) {
                this.applyAbilityEffect(this.cheatinResContext.ability, ability => ({
                    condition: () => [5, 6, 9].includes(player.getHandRank().rank) && !player.isCheatin(),
                    match: player,
                    effect: ability.effects.modifyHandRankMod(2)
                }));
                this.game.addMessage('{0}\'s new hand rank is {2}', player, this, player.getTotalRank());
                this.cheatinResContext = null;
            }
        }
        return true;
    }
}

CominUpRoses.code = '15017';

module.exports = CominUpRoses;
