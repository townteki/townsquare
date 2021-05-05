const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class JokersSmile extends DeedCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onCardAced: event => event.card.getType() === 'joker' && 
                    this.game.currentPhase === 'gambling' &&
                    event.originalLocation === 'draw hand'
            },
            message: context =>
                this.game.addMessage('{0} gains 1 GR thanks to the {1}', context.player, this),
            handler: () => {
                this.controller.modifyGhostRock(1);
            }
        });

        this.action({
            title: 'Discard a Joker from hand',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a joker to discard',
                cardCondition: { location: 'hand', controller: 'current' },
                cardType: ['joker'],
                gameAction: 'discard'
            },
            autoSelect: true,
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to gain 1 GR and draw a card', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                    context.player.modifyGhostRock(1);
                    context.player.drawCardsToHand(1, context);
                });
            }
        });

        this.action({
            title: 'Move a Joker from Boot Hill',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1)
            ],
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a joker to move to discard',
                    waitingPromptTitle: 'Waiting for opponent to select joker',
                    cardCondition: card => card.location === 'dead pile' && card.controller === context.player,
                    cardType: 'joker',
                    autoSelect: true,
                    onSelect: (player, card) => {
                        player.moveCard(card, 'discard pile');
                        this.game.addMessage('{0} uses {1} and pays 1 GR to move {2} from Boot Hill to discard pile', player, this, card);
                        return true;
                    }
                });
            }
        });        
    }
}

JokersSmile.code = '12011';

module.exports = JokersSmile;
