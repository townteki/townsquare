const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MountainLionFriend extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: this.controller,
            effect: ability.effects.modifyPosseDrawBonus(1)
        });

        this.reaction({
            title: 'React: Mountain Lion Friend',
            when: {
                onShootoutCasualtiesStepStarted: () => this.isParticipating()
            },
            cost: ability.costs.aceSelf(),
            handler: context => {
                this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                    player: context.player,
                    amount: 2
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} aces {1} to reduce casualties by 2', context.player, this);
                });
            }
        });
    }
}

MountainLionFriend.code = '14025';

module.exports = MountainLionFriend;
