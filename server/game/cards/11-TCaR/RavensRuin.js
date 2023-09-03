const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RavensRuin extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.attachmentRestriction({ type: 'deed'});
        this.spellAction({
            title: 'Noon: Raven\'s Ruin',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude to move',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.gamelocation !== this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            difficulty: 8,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.target,
                    targetUuid: this.gamelocation
                }), context);
                const totemLocationCard = this.locationCard;
                if(!totemLocationCard) {
                    this.game.addAlert('danger', 'No location card available when using {0} by {1}', this, context.player);
                    return;
                }
                if(totemLocationCard.owner !== context.player && totemLocationCard.control > 0) {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to boot ${totemLocationCard.title}?`,
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.bootCard({ 
                                card: totemLocationCard 
                            }), context).thenExecute(() => {
                                player.modifyGhostRock(1);
                                this.game.addMessage('{0} uses {1} and boots {2} to gain 1 GR', 
                                    context.player, this, totemLocationCard);
                            });
                        },
                        source: this
                    });
                }
                this.game.addMessage('{0} uses {1} to move {2} to {3}', 
                    context.player, this, context.target, totemLocationCard);                
            },
            source: this
        });
    }
}

RavensRuin.code = '19036';

module.exports = RavensRuin;
