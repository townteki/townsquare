const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class LydiaBearHands extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Lydia Bear-Hands',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a spirit to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.parent === this && card.isSpirit() 
                },
                cardType: ['spell'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a dude',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.controller === this.controller &&
                            card.isParticipating(),
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            this.untilEndOfShootoutPhase(ability => ({
                                match: card,
                                effect: ability.effects.addKeyword('harrowed')
                            }));
                            this.game.addMessage('{0} uses {1} and boots {2} to give {3} the Harrowed keyword', 
                                player, this, context.target, card);
                            return true;
                        },
                        source: this
                    });
                });
            }
        });
    }
}

LydiaBearHands.code = '09020';

module.exports = LydiaBearHands;
