const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ExultantTranslocation extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Exultant Translocation',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your other dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.gamelocation !== this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            actionContext: { card: this.parent, gameAction: 'moveDude' },
            difficulty: 6,
            onSuccess: (context) => {
                const originalLocation = this.gamelocation;
                let action = GameActions.simultaneously(
                    [
                        GameActions.moveDude({ 
                            card: this.parent,
                            targetUuid: context.target.gamelocation
                        }),
                        GameActions.moveDude({ 
                            card: context.target,
                            targetUuid: originalLocation
                        })
                    ]
                );
                this.game.resolveGameAction(action).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to swap locations of {2} and {3}', 
                        context.player, this, this.parent, context.target);
                });   
                    
                if((this.parent.booted || context.target.booted) && 
                    context.totalPullValue - 6 >= context.difficulty) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select a dude to unboot',
                        waitingPromptTitle: 'Waiting for opponent to select card',
                        cardCondition: card => (card === this.parent || card === context.target) &&
                            card.booted,
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
            },
            source: this
        });
    }
}

ExultantTranslocation.code = '20044';

module.exports = ExultantTranslocation;
