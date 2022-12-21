const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MagnumOpusTenebri extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            condition: () => true,
            match: card => card.location === 'play area' && card.hasKeyword('huckster'),
            effect: ability.effects.canPerformSkillUsing('huckster', card => card === this)
        });
        
        this.action({
            title: 'Shootout: Magnum Opus Tenebri',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            target: {
                activePromptTitle: 'Choose a dude to send home',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: (card, context) => this.game.shootout &&
                        card.value < this.game.shootout.getPosseStat(context.player, 'bullets') 
                },
                cardType: ['dude']
            },
            handler: context => {
                const difference = this.game.shootout.getPosseStat(context.player, 'bullets') - context.target.value;
                if(difference < 4) {
                    this.game.shootout.sendHome(context.target, context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} and boots {2} to send {3} home booted', 
                            context.player, this, this.parent, context.target);
                    });
                } else {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select an Abomination to ace',
                        waitingPromptTitle: 'Waiting for opponent to select Abomination',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller.equals(context.player) &&
                            card.hasKeyword('abomination'),
                        cardType: 'dude',
                        gameAction: 'ace',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.aceCard({ card }), context).thenExecute(() => {
                                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1}, boots {2} and aces {3} to ace {4}', 
                                        player, this, this.parent, card, context.target);
                                });
                            });
                            return true;
                        },
                        onCancel: player => {
                            this.game.shootout.sendHome(context.target, context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} and boots {2} to send {3} home booted', 
                                    player, this, this.parent, context.target);
                            });
                        },
                        source: this
                    });
                }
            }
        });
    }
}

MagnumOpusTenebri.code = '21044';

module.exports = MagnumOpusTenebri;
