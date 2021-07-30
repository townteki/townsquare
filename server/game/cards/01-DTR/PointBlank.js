const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class PointBlank extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Point Blank',
            playType: 'resolution',
            choosePlayer: false,
            cost: [
                ability.costs.boot(card =>
                    card.getType() === 'dude' &&
                    card.isStud() && 
                    card.isParticipating()
                )
            ],
            handler: context => {
                context.ability.selectAnotherTarget(context.player.getOpponent(), context, {
                    activePromptTitle: 'Select a dude to ace',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.controller &&
                        card.isParticipating() &&
                        card.bullets < context.costs.boot.bullets,
                    cardType: 'dude',
                    gameAction: 'ace',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.aceCard({ card }, context));
                        this.game.addMessage('{0} uses {1} to boot {2}, forcing {3} to ace {4}',
                            this.controller, this, context.costs.boot, player, card);                      
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

PointBlank.code = '01142';

module.exports = PointBlank;
