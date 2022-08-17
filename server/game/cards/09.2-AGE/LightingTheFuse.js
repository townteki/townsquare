const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions/index.js');

class LightingTheFuse extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Lighting the Fuse',
            playType: 'cheatin resolution',
            target: {
                activePromptTitle: 'Select deed to blow up',
                cardCondition: {
                    location: 'play area',
                    condition: card => this.controller.getOpponent().equals(card.owner)
                },
                cardType: 'deed'
            },
            handler: context => {
                const thecheater = context.player.getOpponent();
                const kaboomification = () =>
                    this.game.resolveGameAction(GameActions.ReturnCardToHand({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to detonate {2}', context.player, this, context.target);
                    });
                if(this.game.currentPhase === PhaseNames.Gambling) {
                    context.game.promptForYesNo(thecheater, {
                        title: `Do you want to send two dudes to disarm the bomb at ${context.target.title}?`,
                        onYes: () => {
                            this.game.promptForSelect(thecheater, {
                                activePromptTitle: 'Select two dudes',
                                waitingPromptTitle: 'Waiting for opponent to select dudes',
                                cardCondition: card => card.location === 'play area' &&
                                    card.controller.equals(thecheater) && !card.booted,
                                cardType: 'dude',
                                gameAction: ['moveDude','boot'],
                                multiSelect: true,
                                numCards: 2,
                                mode: 'exactly',
                                onSelect: (p, bombsquad) => {
                                    bombsquad.forEach(body => {
                                        this.game.resolveGameAction(GameActions.moveDude({
                                            card: body,
                                            targetUuid: context.target.uuid,
                                            options: { needToBoot: true, allowBooted: true }
                                        }), context);
                                    });
                                    this.game.addMessage('{0} uses {1} on {2}; {3} rush to stop it',
                                        context.player, this, context.target, bombsquad);
                                    return true;
                                },
                                onCancel: () => kaboomification(),
                                source: this
                            });
                        },
                        onNo: () => kaboomification(),
                        source: this
                    });
                } else {//not gambling, must be a shootout
                    kaboomification();
                }
            },
            source: this
        });
    } 
}

LightingTheFuse.code = '16020';

module.exports = LightingTheFuse;
