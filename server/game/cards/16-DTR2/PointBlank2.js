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
                this.game.promptForSelect(context.player.getOpponent(), {
                    activePromptTitle: 'Select a dude to ace',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: { location: 'play area', controller: context.player.getOpponent(), participating: true, condition: card => card.bullets < context.costs.boot.bullets },
                    cardType: 'dude',
                    onSelect: (opponent, cardToAce) => {
                        this.game.resolveGameAction(GameActions.aceCard({card: cardToAce}, context));
                        this.game.addMessage('{0} uses {1} to boot {2}, forcing {3} to ace {4}',
                            context.player, this, context.costs.boot, opponent, cardToAce);
                        return true;
                    }
                });
            }
        });
    }
}

PointBlank2.code = '25149';

module.exports = PointBlank2;
