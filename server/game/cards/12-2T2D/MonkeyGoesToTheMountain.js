const GameActions = require('../../GameActions');
const TechniqueCard = require('../../techniquecard');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MonkeyGoesToTheMountain extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Shootout: Monkey Goes to the Mountain',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose dude to move out',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    participating: true,
                    condition: (card, context) => !context.kfDude ||
                        card.bullets <= context.kfDude.getKungFuRating()
                },
                cardType: ['dude'],
                gameAction: ['moveDude', 'removeFromPosse']
            },
            actionContext: { gameAction: ['moveDude', 'removeFromPosse'] },
            onSuccess: (context) => {
                if(!context.kfDude.booted) {
                    this.game.promptForLocation(context.player, {
                        activePromptTitle: 'Select location',
                        waitingPromptTitle: 'Waiting for opponent to select location',
                        cardCondition: { 
                            location: 'play area',
                            condition: card => card.isAdjacent(context.kfDude.gamelocation) &&
                                !this.game.isHome(card.gamelocation, context.player)
                        },
                        onSelect: (player, location) => {
                            let actionMove = GameActions.simultaneously(
                                [
                                    GameActions.moveDude({ 
                                        card: context.kfDude, 
                                        targetUuid: location.uuid
                                    }),
                                    GameActions.moveDude({ 
                                        card: context.target, 
                                        targetUuid: location.uuid
                                    })
                                ]
                            );
                            this.game.resolveGameAction(actionMove, context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to move both {2} and {3} out of the shootout to {4}', 
                                    player, this, context.kfDude, context.target, location);   
                            });                              
                            return true;
                        },
                        source: this
                    });
                } else {
                    this.game.addMessage('{0} uses {1}, but {2} is booted thus the technique does not have any effect', 
                        context.player, this, context.kfDude); 
                }
            }
        });
    }
}

MonkeyGoesToTheMountain.code = '20054';

module.exports = MonkeyGoesToTheMountain;
