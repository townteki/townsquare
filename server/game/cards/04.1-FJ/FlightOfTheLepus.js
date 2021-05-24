const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class FlightOfTheLepus extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Flight of the Lepus',
            playType: ['cheatin resolution'],
            handler: context => {
                const numToSelect = context.player.isCheatin() ? 2 : 3;
                this.game.promptForSelect(context.player, {
                    activePromptTitle: `Select up to ${numToSelect} dudes`,
                    waitingPromptTitle: 'Waiting for opponent to select dudes',
                    cardCondition: card => card.location === 'play area' && 
                        (!this.game.shootout || card.isParticipating()),
                    cardType: 'dude',
                    numCards: numToSelect,
                    multiSelect: true,
                    gameAction: 'moveDude',
                    onSelect: (player, cards) => {
                        if(this.game.shootout) {
                            this.game.promptForYesNo(player, {
                                title: 'Do you want to boot selected dudes?',
                                onYes: player => {
                                    this.flightOfSelectedDudes(player, cards, true, context);
                                },
                                onNo: player => {
                                    this.flightOfSelectedDudes(player, cards, false, context);
                                }
                            });
                        } else {
                            this.flightOfSelectedDudes(player, cards, false, context);
                        }
                        return true;
                    },
                    source: this
                });
            }
        });
    }

    flightOfSelectedDudes(player, dudes, boot, context) {
        dudes.forEach(dude => {
            const homeUuid = dude.controller.outfit.uuid;
            this.game.resolveGameAction(GameActions.moveDude({ card: dude, targetUuid: homeUuid }), context).thenExecute(() => {
                this.game.shootout.removeFromPosse(dude);
            });
            if(boot) {
                this.game.resolveGameAction(GameActions.bootCard({ card: dude }), context);
            }
        });
        const bootText = boot ? ' and boot them' : '';
        this.game.addMessage('{0} uses {1} and selects {2} to move them home{3}', 
            player, this, dudes, bootText);
    }
}

FlightOfTheLepus.code = '06021';

module.exports = FlightOfTheLepus;
