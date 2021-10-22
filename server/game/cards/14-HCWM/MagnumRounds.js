const GameActions = require('../../GameActions');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MagnumRounds extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Magnum Rounds',
            playType: ['shootout'],
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: ability.effects.modifyBullets(1)
                }));
                if(!context.player.isCheatin()) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this.game.getPlayers(),
                        effect: [
                            ability.effects.cannotModifyHandRanks(this, context => context.ability && 
                                ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context))),
                            ability.effects.cannotIncreaseCasualties(this, context => context.ability && 
                                ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context))),
                            ability.effects.cannotDecreaseCasualties(this, context => context.ability && 
                                ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context)))                                
                        ]
                    }));
                    this.game.addMessage('{0} uses {1} to give {2} +1 bullets, hand ranks and casualties cannot be modified ' +
                        'this shootout by other than Traits and Cheatin\' Resolutions', context.player, this, this.parent);
                } else {
                    this.game.addMessage('{0} uses {1} to give {2} +1 bullets', context.player, this, this.parent);
                }
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context);
            }
        });
    }
}

MagnumRounds.code = '22039';

module.exports = MagnumRounds;
