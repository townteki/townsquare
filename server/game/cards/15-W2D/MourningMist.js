const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MourningMist extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Mourning Mist',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.aceSelf()
            ],
            target: {
                activePromptTitle: 'Choose a dude to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.isNearby(this.gamelocation) 
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            message: context => 
                this.game.addMessage('{0} aces {1} to boot {2}', 
                    context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });
    }
}

MourningMist.code = '23010';

module.exports = MourningMist;
