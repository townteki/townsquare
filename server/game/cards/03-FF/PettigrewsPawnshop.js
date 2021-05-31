const DeedCard = require('../../deedcard.js');

class PettigrewsPawnshop extends DeedCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardPutIntoPlay: event =>
                    !event.card.hasOneOfKeywords(['gadget']) && event.card.getType() === 'goods'
            },
            message: () => this.game.addMessage('{0} gains 1 GR from {1}', this.controller, this),
            handler: () => {
                this.controller.modifyGhostRock(1);
            }
        });
    }
}

PettigrewsPawnshop.code = '05020';

module.exports = PettigrewsPawnshop;
