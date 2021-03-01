const DudeCard = require('../../dudecard.js');

class AndroclesBrocklehurst extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'AndroclesBrocklehurst',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude',
                cardCondition: { location: 'play area', controller: 'opponent', condition: card => 
                    card.locationCard.owner === this.controller && card.locationCard.controller !== this.controller
                },
                cardType: ['dude'],
                source: this
            },
            handler: context => {
                this.controller.modifyGhostRock(context.target.influence);
                this.game.addMessage('{0} uses {1} to represent {2} and gains {3} GR.', context.player, this, context.target, context.target.influence);
            }
        });
    }
}

AndroclesBrocklehurst.code = '01050';

module.exports = AndroclesBrocklehurst;
