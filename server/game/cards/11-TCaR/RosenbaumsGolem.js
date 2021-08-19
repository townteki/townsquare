const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class RosenbaumsGolem extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Rosenbaum\'s Golem',
            cost: ability.costs.bootSelf(),
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            message: context => this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    context.game.promptForYesNo(context.player, {
                        title: 'Do you want to give ' + context.target.title + ' +5 value?',
                        onYes: () => {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: context.target,
                                effect: [
                                    ability.effects.modifyValue(5)
                                ]
                            }));
                            this.game.addMessage('{0} uses {1} to give {2} +5 value', context.player, this, context.target);
                            if(context.target.getGrit() >= 11) {
                                context.ability.selectAnotherTarget(context.player, context, {
                                    activePromptTitle: 'Select your dude',
                                    cardCondition: {
                                        condition: card => card.controller === this.controller && card !== this,
                                        location: 'play area'
                                    },
                                    cardType: 'dude',
                                    gameAction: 'unboot',
                                    onSelect: (player, card) => {
                                        this.game.resolveGameAction(GameActions.unbootCard({ card }), context).thenExecute(() => {
                                            this.game.addMessage('{0} uses {1} to unboot {2}', player, this, card);
                                        });
                                        return true;
                                    },
                                    source: this
                                });
                            }
                        }
                    });
                });
            }
        });
    }
}

RosenbaumsGolem.code = '19010';

module.exports = RosenbaumsGolem;

