const DeedCard = require('../../deedcard.js');

class EpidemicLaboratory extends DeedCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Epidemic Laboratory',
            playType: 'noon',
            cost: ability.costs.bootLeader(card => card.isSkilled()),
            target: {
                cardCondition: { 
                    condition: card => card === this
                },
                autoSelect: true
            },
            leaderCondition: card => card.isSkilled(),
            onSuccess: () => {
                this.game.addMessage('{0} uses {1} to give it +1 GR and +1 CP', this.controller, this);
                this.modifyProduction(1);
                this.modifyControl(1);
            }
        });
    }
}

EpidemicLaboratory.code = '14019';

module.exports = EpidemicLaboratory;
