const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LuFeng extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Boot Dude or Deed',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Deed or Dude to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => !card.equals(this) && card.isInSameLocation(this) 
                },
                cardType: ['deed', 'dude'],
                gameAction: 'boot'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });
    }
}

LuFeng.code = '25003';

module.exports = LuFeng;
