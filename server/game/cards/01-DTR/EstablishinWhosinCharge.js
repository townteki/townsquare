const ActionCard = require('../../actioncard.js');

class EstablishinWhosinCharge extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Establishin\' Who\'s in Charge',
            playType: 'noon',
            target: {
                activePromptTitle: 'Select in-town deed',
                cardCondition: { location: 'play area', condition: card => !card.isOutOfTown()},
                cardType: 'deed'
            },
            message: context =>
                this.game.addMessage('{0} plays {1} marking {2}.', this.owner, this, context.target),
            onSuccess: (job) => {
                job.mark.modifyControl(1);
                this.game.addMessage('{0} successfuly established who\'s in charge. {1} is worth 1 more control', this.owner, job.mark);
            }
        });
    }
}

EstablishinWhosinCharge.code = '01105';

module.exports = EstablishinWhosinCharge;
