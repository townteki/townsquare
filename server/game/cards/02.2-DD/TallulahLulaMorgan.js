const DudeCard = require('../../dudecard.js');

class TallulahLulaMorgan extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Tallulah "Lula" Morgan',
            playType: ['noon'],
            cost: [ 
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1)
            ],
            target: {
                activePromptTitle: 'Choose a deed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.owner !== this.controller 
                },
                cardType: ['deed']
            },
            message: context => this.game.addMessage('{0} uses {1} to gain {2} GR from {3}',
                context.player, this, context.target.production, context.target),
            handler: context => context.player.modifyGhostRock(context.target.production)
        });
    }
}

TallulahLulaMorgan.code = '03005';

module.exports = TallulahLulaMorgan;
