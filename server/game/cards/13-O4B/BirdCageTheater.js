const DeedCard = require('../../deedcard.js');

class BirdCageTheater extends DeedCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Bird Cage Theater',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { location: 'play area', controller: 'opponent', condition: card => card.control > 0 },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to lead a job to reduce {2}\'s CP to 0', context.player, this, context.target),
            onSuccess: (job) => {
                job.mark.modifyControl(-job.mark.control);
                this.modifyControl(1);
                this.modifyProduction(1);
                this.game.addMessage('{0} uses {1} to reduce {2}\'s CP to 0 and {1} gains a permanent +1 CP and +1 production', this.controller, this, job.mark);
            }
        });
    }
}

BirdCageTheater.code = '21041';

module.exports = BirdCageTheater;
