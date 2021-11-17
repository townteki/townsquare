const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Swagger extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Swagger',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose your dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    booted: false
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: `Select where ${context.target.title} should move to`,
                    cardCondition: { 
                        location: 'play area', 
                        condition: card => card.isAdjacent(context.target.gamelocation) 
                    },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);
                        this.untilEndOfPhase(context.ability, ability => ({
                            match: context.target,
                            effect: ability.effects.modifyDeedInfluence(1)
                        }), PhaseNames.Upkeep
                        );                        
                        this.game.addMessage('{0} uses {1} to move {2} to {3} and gives them +1 influence for controlling deeds until end of Upkeep', 
                            player, this, context.target, location);                                 
                        return true;
                    },
                    source: this,
                    context
                });   
            }
        });
    }
}

Swagger.code = '23055';

module.exports = Swagger;
