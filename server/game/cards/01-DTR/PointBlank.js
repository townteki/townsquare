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
            target: {
                activePromptTitle: 'Select a dude to ace',
                choosingPlayer: 'opponent',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true, 
                    condition: (card, context) => card.bullets < context.costs.boot.bullets 
                },
                cardType: ['dude'],
                gameAction: 'ace'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }, context));
                this.game.addMessage('{0} uses {1} to boot {2}, forcing {3} to ace {4}',
                    this.controller, this, context.costs.boot, context.target.controller, context.target);
            }
        });
    }
}

PointBlank.code = '01142';

module.exports = PointBlank;
