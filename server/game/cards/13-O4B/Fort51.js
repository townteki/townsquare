const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class Fort51 extends OutfitCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                onGadgetInvented: event => event.gadget.hasKeyword('Weapon') || event.gadget.getType() === 'dude' && event.player === this.controller
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && card.controller !== this.controller && card.influence < context.event.gadget.cost,
                    cardType: 'dude',
                    gameAction: 'addBounty',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.addBounty({ card, amount: 1 }), context);
                        this.game.addMessage('{0} gives {1} 1 bounty thanks to {2}', player, card, this);
                        return true;
                    }
                });
            }
        });

        this.action({
            title: 'Noon: Remove Bounty',
            playType: 'noon',
            cost: ability.costs.boot(card =>
                card.hasKeyword('gadget') && card.controller === this.controller && !card.isAtHome()
            ),
            target: {
                activePromptTitle: 'Select a dude',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: card =>
                        card.controller !== this.controller && card.isWanted()
                },
                cardType: ['dude'],
                gameAction: 'removeBounty'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.removeBounty({
                    card: context.target, amount: 1
                })).thenExecute(() => {
                    context.player.modifyGhostRock(1);
                    this.game.addMessage('{0} uses {1} to boot {2}, take 1 bounty from {3} and gain 1 GR', context.player, this, context.costs.boot, context.target);
                });

                this.game.promptForYesNo(context.player, {
                    title: 'Do you want to discard a card?',
                    onYes: () => {
                        context.player.discardFromHand(1, discarded => {
                            this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, discarded)
                        },   { title: this.title });
                    }
                });
            }
        });
    }
}

Fort51.code = '21004';

module.exports = Fort51;
