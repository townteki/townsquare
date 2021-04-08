const DeedCard = require('../../deedcard.js');

class Undertaker extends DeedCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardAced: event => event.card.getType() === 'dude' && event.originalLocation === 'play area'
            },
            message: context =>
                this.game.addMessage('{0} gains 2 GR thanks to the {1}', context.player, this),
            handler: () => {
                this.controller.modifyGhostRock(2);
            }
        });
    }
}

Undertaker.code = '01076';

module.exports = Undertaker;
