const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class CulpabilityScientizer extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onGadgetInvented: event => event.gadget === this
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area',
                    cardType: 'dude',
                    gameAction: 'addBounty',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.addBounty({ card, amount: 2 }), context);
                        this.game.addMessage('{0} gives {1} 2 bounty thanks to {2}', player, card, this);
                        return true;
                    }
                });
            }
        });
        this.action({
            title: 'Culpability Scientizer',
            playType: ['noon'],
            // cannot use discard cost without additional code because then we lose information
            // about the location 
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current',
                    condition: card => card.gamelocation === this.gamelocation
                },
                cardType: ['dude']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select dude to call out',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.getType() === 'dude' && card.location === 'play area' &&
                            card.gamelocation === context.target.gamelocation &&
                            card.controller !== this.controller &&
                            card.isWanted(),
                        cardType: 'dude',
                        gameAction: 'callout',
                        onSelect: (player, card) => {
                            let eventHandler = () => {
                                this.game.once('onPlayWindowOpened', () => {
                                    this.game.makePlayOutOfOrder(player, this, 'Make shootout play');
                                });
                            };
                            this.game.once('onDudeAcceptedCallOut', eventHandler);
                            this.game.once('onCardCallOutFinished', () => {
                                this.game.removeListener('onDudeAcceptedCallOut', eventHandler);
                            });
                            this.game.addMessage('{0} uses {1} and chooses {2} to call out {3}', context.player, this, context.target, card);
                            this.game.resolveGameAction(GameActions.callOut({ caller: context.target, callee: card }), context);
                            return true;
                        }
                    });
                });
            }
        });
    }
}

CulpabilityScientizer.code = '15011';

module.exports = CulpabilityScientizer;
