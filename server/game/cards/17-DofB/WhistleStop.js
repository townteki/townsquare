const GameActions = require('../../GameActions');
const GoodsCard = require('../../goodscard.js');

class WhistleStop extends GoodsCard {
    setupCardAbilities() {
        this.action({
            title: 'Whisle Stop',
            playType: ['shootout'],
            message: context => 
                this.game.addMessage('{0} uses {1} and discards it to give -1 bullets to opposing dudes', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    targetController: 'opponent',
                    match: card => card.getType() === 'dude' && card.isOpposing(context.player),
                    effect: [
                        ability.effects.modifyBullets(-1)
                    ]
                }));
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(pulledSuit.toLowerCase() === 'clubs') {
                        this.applyAbilityEffect(context.ability, ability => ({
                            targetController: 'current',
                            match: card => card.getType() === 'dude' && card.isParticipating() && card.controller.equals(this.controller),
                            effect: [
                                ability.effects.modifyBullets(-1)
                            ]
                        }));
                        this.game.addMessage('{0} gives -1 bullets penalty to their dudes because {1} fails', context.player, this);
                    }
                }, true, { context });                               
            }
        });
    }
}

WhistleStop.code = '25042';

module.exports = WhistleStop;
