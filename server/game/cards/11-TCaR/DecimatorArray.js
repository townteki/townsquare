const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class DecimatorArray extends GoodsCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onGadgetInvented: event => event.gadget === this && 
                    this.controller.cardsInPlay.some(card => card.getType() === 'dude' && card.hasKeyword('mad scientist') && card.booted)
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a Mad Scientist to unboot',
                    waitingPromptTitle: 'Waiting for opponent to select card',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller === this.controller && 
                        card.hasKeyword('mad scientist'),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.unbootCard({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} unboots {1} thanks to {2}', player, card, this);
                        });
                        return true;
                    }
                });
            }
        });
        this.whileAttached({
            condition: () => this.parent && this.parent.hasKeyword('mad scientist'),
            effect: [
                ability.effects.modifyUpkeep(-1),
                ability.effects.modifyValue(3)
            ]
        });
        this.persistentEffect({
            condition: () => this.parent && this.parent.hasKeyword('mad scientist'),
            match: this,
            effect: ability.effects.addKeyword('sidekick')
        });
        this.action({
            title: 'Decimator Array',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a card in draw hand',
                choosingPlayer: 'current',
                cardCondition: { location: 'draw hand', controller: 'current' },
                cardType: ['dude', 'deed', 'action', 'goods', 'spell']
            },
            handler: context => {
                if(context.target.suit === 'Hearts') {
                    this.cardToChange = context.target;
                    this.game.promptForValue(context.player, `Change value in ${context.target.value} of ${context.target.suit} to`, 'chooseValue', this, this);
                } else {
                    this.untilEndOfShootoutRound(ability => ({
                        match: context.target,
                        effect: ability.effects.setSuit('Hearts', this.uuid)
                    }), null, 'draw hand');
                    this.game.addMessage('{0} uses {1} to change suit of {2} to Hearts', context.player, this, context.target);
                    context.player.determineHandResult('changes hand to');               
                }
            }
        });
    }

    chooseValue(player, arg) {
        this.untilEndOfShootoutRound(ability => ({
            match: this.cardToChange,
            effect: ability.effects.setValue(arg, this.uuid)
        }), null, 'draw hand');
        this.game.addMessage('{0} uses {1} to change value of {2} to {3}', player, this, this.cardToChange, arg);
        player.determineHandResult('changes hand to');
        return true;
    }
}

DecimatorArray.code = '19028';

module.exports = DecimatorArray;
