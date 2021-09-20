const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HartsTeaShoppe extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Hart\'s Tea Shoppe',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose opposing card',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
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

HartsTeaShoppe.code = '21040';

module.exports = HartsTeaShoppe;
