const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SteeleArcherExp1 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Steele Archer (Exp.1)',
            playType: 'noon',
            target: {
                activePromptTitle: 'Choose hex',
                cardCondition: {
                    location: 'play area',
                    condition: card => card.parent && card.isNearby(this.gamelocation) && card.hasKeyword('hex') && card.booted
                },
                cardType: ['spell']
            },
            message: context => this.game.addMessage('{0} uses {1} to refresh {2}\'s {3}',
                context.player, this, context.target.parent, context.target),
            handler: (context) => {
                context.target.resetAbilities();
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
            }
        });
    }
}

SteeleArcherExp1.code = '08008';

module.exports = SteeleArcherExp1;
