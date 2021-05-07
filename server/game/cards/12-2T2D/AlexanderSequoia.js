const GameActions = require('../../GameActions/index.js');
const DudeCard = require('../../dudecard.js');

class AlexanderSequoia extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            /*condition: () => true,*/
            ifCondition: () => this.isInTownSquare(),
            effect: ability.effects.modifySundownDiscard(1)
        });
        
        this.action({
            title: 'Noon',
            playType: 'noon',
            ifCondition: () => this.isInTownSquare(),
            cardCondition: this.booted,
            message: context => this.game.addMessage('{0} uses {1} to unboot {1}', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
            }
        });
    }
}

AlexanderSequoia.code = '20010';

module.exports = AlexanderSequoia;
