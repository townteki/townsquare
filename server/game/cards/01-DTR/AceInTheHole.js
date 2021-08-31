const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class AceInTheHole extends SpellCard {
    setupCardAbilities(ability) {
        this.spellReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout
            },
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            difficulty: 6,
            onSuccess: context => {
                if(context.player.hand.length <= 0) {
                    this.game.addMessage('{0} uses {1} but it does not have any effect because they have empty hand', context.player, this, this.parent);
                    return;
                }
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a card to ace',
                    waitingPromptTitle: 'Waiting for opponent to select card',
                    cardCondition: card => card.controller === context.player && card.location === 'draw hand',
                    onSelect: (player, cardToAce) => {
                        if(player.hand.length > 0) {
                            this.game.resolveGameAction(GameActions.aceCard({ card: cardToAce }));
                            this.game.promptForSelect(player, {
                                activePromptTitle: 'Select a card to put into draw hand',
                                waitingPromptTitle: 'Waiting for opponent to select replacement card',
                                cardCondition: card => card.controller === context.player && card.location === 'hand',
                                onSelect: (player, replacementCard) => {
                                    if(player.moveCardWithContext(replacementCard, 'draw hand', context)) {
                                        this.game.addMessage('{0} uses {1} cast by {2} to ace {3} in draw hand and replace it with {4}', 
                                            context.player, this, this.parent, cardToAce, replacementCard);
                                        player.determineHandResult('changes hand to');
                                    } else {
                                        this.game.addMessage('{0} uses {1} cast by {2}, but some effect prevents them from moving {3} to draw hand', 
                                            context.player, this, this.parent, replacementCard);
                                    }
                                    return true;
                                }
                            });
                        }
                        return true;
                    }
                });
            }
        });
    }
}

AceInTheHole.code = '01101';

module.exports = AceInTheHole;

