const ActionCard = require('../../actioncard.js');

class ACoachComesToTown extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'A Coach Comes to Town',
            playType: 'noon',
            target: 'townsquare',
            message: context =>
                this.game.addMessage('{0} plays {1} marking {2}', context.player, this, context.target),
            onSuccess: () => {
                this.owner.modifyGhostRock(4);
                this.game.addMessage('{0} successfuly escorts the coach and gets 4 GR', this.owner);
            },
            onFail: () => {
                this.owner.getOpponent().modifyGhostRock(4);
                this.game.addMessage('{0} fails to protect the coach and {1} gets 4 GR', this.owner, this.owner.getOpponent());
            }
        });
    }
}

ACoachComesToTown.code = '01135';

module.exports = ACoachComesToTown;
