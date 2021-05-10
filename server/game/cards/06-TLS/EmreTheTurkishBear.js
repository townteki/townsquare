const DudeCard = require('../../dudecard.js');

class EmreTheTurkishBear extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Emre, The Turkish Bear',
            when: {
                onCardPulled: event => true
            },
            cost: [ability.costs.bootSelf()],
            target: targetselect
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                
            }
        });
    }
}

EmreTheTurkishBear.code = '10005';

module.exports = EmreTheTurkishBear;
