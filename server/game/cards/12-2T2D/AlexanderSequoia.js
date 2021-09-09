const GameActions = require('../../GameActions/index.js');
const DudeCard = require('../../dudecard.js');

class AlexanderSequoia extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isInTownSquare(),
            effect: ability.effects.modifySundownDiscard(1)
        });
        
        this.action({
            title: 'Noon: Unboot Alexander Sequoia',
            playType: 'noon',
            ifCondition: () => this.isInTownSquare(),
            ifFailMessage: context => {
                this.game.addMessage('{0} uses {1}\'s ability but {1} does not unboot because {1} is not in town square', context.player, this);
            },
            cardCondition: this.booted,
            actionContext: { card: this, gameAction: 'unboot' },
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to unboot {1}', context.player, this);
                });
            }
        });
    }
}

AlexanderSequoia.code = '20010';

module.exports = AlexanderSequoia;
