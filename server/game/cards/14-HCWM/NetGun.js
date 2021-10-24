const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NetGun extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Net Gun',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.pull()
            ],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                const dudeMDRating = this.parent.getSkillRating('mad scientist') || 0;
                if(context.pull.pulledValue + dudeMDRating >= context.target.value) {
                    this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: ability.effects.setAsDraw()
                        }));
                        this.game.addMessage('{0} uses {1} and discards it to make {2} a draw', 
                            context.player, this, context.target);
                    });
                } else {
                    this.game.addMessage('{0} uses {1} but it misses the {2}', context.player, this, context.target);
                }
            }
        });
    }
}

NetGun.code = '22041';

module.exports = NetGun;
