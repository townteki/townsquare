const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class LaQuema2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyValue(3)
        });
        this.action({
            title: 'La Quema',
            playType: ['shootout:join'],
            cost: ability.costs.bootSelf(),
            actionContext: { card: this.parent, gameAction: 'joinPosse' },
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }), context);
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to boot',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller !== this.controller && 
                        card.isParticipating(),
                    cardType: 'dude',
                    gameAction: 'boot',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to have {2} join posse and boot {3}', player, this, this.parent, card);
                        });
                        return true;
                    },
                    onCancel: player => {
                        this.game.addMessage('{0} uses {1} to have {2} join posse', player, this, this.parent);
                    },
                    source: this
                });
            }
        });
    }
}

LaQuema2.code = '24145';

module.exports = LaQuema2;
