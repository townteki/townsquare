const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class RunEmDown extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Run \'Em Down',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose location with mounted dudes',
                cardCondition: { 
                    location: 'play area', 
                    condition: card => this.game.getDudesAtLocation(card.gamelocation).some(occupant => occupant.hasHorse()) },
                cardType: ['location']
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select dudes with horse',
                    waitingPromptTitle: 'Waiting for opponent to select mounted dudes',
                    multiSelect: true,
                    numCards: 0,
                    cardCondition: card => card.controller === context.player && card.gamelocation === context.target.uuid && card.hasHorse(),
                    cardType: 'dude',
                    onSelect: (player, cards) => {
                        this.game.promptForSelect(player, {
                            activePromptTitle: 'Select a dude to be runned down',
                            waitingPromptTitle: 'Waiting for opponent to select dude',
                            cardCondition: card => card.location === 'play area' && card.isAdjacent(context.target.uuid) && !card.hasHorse(),
                            cardType: 'dude',
                            onSelect: (player, runnedDude) => {
                                let action = GameActions.simultaneously(
                                    cards.map(card => GameActions.moveDude({ 
                                        card: card, 
                                        targetUuid: runnedDude.gamelocation
                                    }))
                                );
                                this.game.resolveGameAction(action).thenExecute(() => {
                                    this.game.resolveGameAction(GameActions.bootCard({ card: runnedDude }), context).thenExecute(() => {
                                        this.game.promptForSelect(player, {
                                            activePromptTitle: 'Select a dude to call out ' + runnedDude.title,
                                            waitingPromptTitle: 'Waiting for opponent to select dude',
                                            cardCondition: card => card.location === 'play area' && card.gamelocation === runnedDude.gamelocation,
                                            cardType: 'dude',
                                            onSelect: (player, callerDude) => {
                                                this.game.resolveGameAction(GameActions.callOut({ caller: callerDude, callee: runnedDude }), context);
                                                this.game.addMessage('{0} uses {1} to move {2} to {3}, boot {4} and call them out', 
                                                    player, this, cards, runnedDude.locationCard, runnedDude);
                                                return true;
                                            },
                                            onCancel: player =>
                                                this.game.addMessage('{0} uses {1} to move {2} to {3} and boot {4}', 
                                                    player, this, cards, runnedDude.locationCard, runnedDude)
                                        });
                                    }, context);
                                }, context);                                
                                return true;
                            }
                        });
                        return true;
                    }
                });
            }
        });
    }
}

RunEmDown.code = '01125';

module.exports = RunEmDown;
