const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class KimLloyd extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Kim Lloyd',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a wanted dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    wanted: true,
                    condition: card => card.gamelocation === this.gamelocation
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select target location',
                    waitingPromptTitle: 'Waiting for opponent to select target location',
                    cardCondition: { 
                        location: 'play area', 
                        condition: card => card.isAdjacent(this.gamelocation)
                    },
                    cardType: 'deed',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context).thenExecute(() => {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: this,
                                effect: [
                                    ability.effects.setAsStud()
                                ]
                            }));
                            this.game.addMessage('{0} uses {1} to move {2} to {3} and make {1} a stud', player, this, context.target, location);
                        });   
                        return true;
                    },
                    source: this
                });   
            }
        });
    }
}

KimLloyd.code = '25021';

module.exports = KimLloyd;
