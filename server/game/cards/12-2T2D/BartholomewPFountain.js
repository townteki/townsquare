const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BartholomewPFountain extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Bartholomew P. Fountain',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => card.location === 'play area' &&
                    card.owner === this.controller &&
                    card.hasKeyword('ranch')
                )
            ],
            target: {
                activePromptTitle: 'Choose a dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.isNearby(this.gamelocation) 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: `Select where ${context.target.title} should move to`,
                    cardCondition: { 
                        location: 'play area',
                        condition: card => card.controller === context.player ||
                            card.owner === context.player
                    },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} and boots {2} to move {3} to {4}', 
                            player, this, context.costs.boot, context.target, location);                                 
                        return true;
                    },
                    onCancel: player =>
                        this.game.addMessage('{0} uses {1} and boots {2}, but does not select where to move {3}', 
                            player, this, context.costs.boot, context.target),
                    source: this
                });
            }
        });
    }
}

BartholomewPFountain.code = '20025';

module.exports = BartholomewPFountain;
