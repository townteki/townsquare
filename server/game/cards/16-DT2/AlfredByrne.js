const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AlfredByrne extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Afred Byrne',
            playType: ['noon'],
            cost: ability.costs.boot(card => card === this ||
                (card.parent === this && card.hasKeyword('hex'))),
            target: {
                activePromptTitle: 'Choose card to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.parent &&
                        card.gamelocation === this.gamelocation 
                },
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

AlfredByrne.code = '24044';

module.exports = AlfredByrne;
