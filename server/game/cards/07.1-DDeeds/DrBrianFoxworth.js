const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

const DrReactTitle = 'Dr. Brian Foxworth';

class DrBrianFoxworth extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isInTownSquare() && !this.booted && !this.hasAttachment(),
            match: this,
            effect: ability.effects.cannotBeCalledOut()
        });
        this.reaction({
            title: DrReactTitle,
            when: {
                onShootoutCasualtiesStepStarted: () => this.location === 'play area'
            },
            handler: context => {
                const DrInf = this.influence;
                context.game.promptForYesNo(context.player, {
                    title: `Do you want to discard ${this.title} to reduce your casualties by ${DrInf}?`,
                    onYes: () => {
                        this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                            this.game.resolveGameAction(GameActions.decreaseCasualties({
                                player: context.player,
                                amount: DrInf
                            }), context).thenExecute(() => {
                                this.game.addMessage('{0} discards {1} to reduce their casualties by {2}',
                                    context.player, this, DrInf);
                            });
                        });
                    },
                    onNo: () => this.abilities.reactions.filter(reaction => reaction.title === DrReactTitle).forEach(reaction => reaction.resetAbilityUsage()),
                    source: this
                });
            },
            source: this
        });
    }
}

DrBrianFoxworth.code = '11010';

module.exports = DrBrianFoxworth;
