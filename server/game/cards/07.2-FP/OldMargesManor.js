const DeedCard = require('../../deedcard.js');

class OldMargesManor extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Move GR to Old Marge\'s Manor',
            when: {
                onEvent: event => true
            },
            cost: [ability.costs.bootSelf()],
            target: targetselect
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                
            }
        });
        this.action({
            title: 'Noon: Place 1 GR on Old Marge\'s Manor',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context => this.game.addMessage('{0} uses {1} to place 1 GR on it', context.player, this),
            handler: context => {
                this.modifyGhostRock(1);
            }
        });
    }
}

OldMargesManor.code = '12012';

module.exports = OldMargesManor;
