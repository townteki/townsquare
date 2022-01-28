const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class PointBlank2 extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Point Blank',
            playType: 'resolution',
            choosePlayer: false,
            cost: [
                ability.costs.boot(card =>
                    card.getType() === 'dude' &&
                    card.isStud() && !card.isToken() &&
                    card.isParticipating()
                )
            ],
            handler: context => {
                context.ability.selectAnotherTarget(context.player.getOpponent(), context, {
                    activePromptTitle: 'Select a dude to ace',
                    cardCondition: { location: 'play area', controller: context.player.getOpponent(), participating: true, condition: card => card.bullets < context.costs.boot.bullets },
                    cardType: 'dude',
                    gameAction: 'ace',
                    onSelect: (opponent, cardToAce) => {
                        this.game.resolveGameAction(GameActions.aceCard({ card: cardToAce }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} and boots {2}, forcing {3} to ace {4}',
                                context.player, this, context.costs.boot, opponent, cardToAce);
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

PointBlank2.code = '24257';

module.exports = PointBlank2;
