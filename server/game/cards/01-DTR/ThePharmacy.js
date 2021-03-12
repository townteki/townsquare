const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class ThePharmacy extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Pharmacy',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to unboot',
                cardCondition: { location: 'play area', booted: true },
                cardType: ['dude']
            },
            message: context => {this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.target);},
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
            }
        });
    }
}

ThePharmacy.code = '01078';

module.exports = ThePharmacy;
