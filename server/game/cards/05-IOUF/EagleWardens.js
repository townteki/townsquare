const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class EagleWardens extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Eagle Wardens',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => card.location === 'play area' &&
                    card.controller === this.owner &&
                    card.getType() === 'dude' &&
                    card.gamelocation === this.game.townsquare.uuid)
            ],
            handler: context => {
                this.abilityContext = context;
                let cardsToDraw = context.costs.boot.influence < 2 ? 2 : 3;
                context.player.drawCardsToHand(cardsToDraw, context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} and boots {2} to draw {3} cards', 
                        context.player, this, context.costs.boot, cardsToDraw);
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a card',
                        cardCondition: { location: 'hand', controller: 'current' },
                        onSelect: (player, card) => {
                            this.abilitySelectedCard = card;
                            this.game.promptWithMenu(player, this, {
                                activePrompt: {
                                    menuTitle: `Choose action on ${card.title}`,
                                    buttons: [
                                        { text: 'Ace card', method: 'eagleWardensAction', arg: 'ace' },
                                        { text: 'Discard card', method: 'eagleWardensAction', arg: 'discard' }
                                    ]
                                },
                                source: this
                            });
                            return true;
                        },
                        source: this,
                        context
                    });
                });
            }
        });
    }

    eagleWardensAction(player, arg) {
        const action = arg === 'ace' ? GameActions.aceCard({ card: this.abilitySelectedCard }) :
            GameActions.discardCard({ card: this.abilitySelectedCard });
        this.game.resolveGameAction(action, this.abilityContext).thenExecute(() => {
            this.game.addMessage('{0} uses {1} to {2} {3}', player, this, arg, this.abilitySelectedCard);
        });
        return true;
    }
}

EagleWardens.code = '09002';

module.exports = EagleWardens;
