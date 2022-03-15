const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class EvanLucas extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardAced: event => this.isParticipating() && 
                    !this.controller.equals(event.card.controller) &&
                    event.card.getType() === 'dude' && event.fromPosse
            },
            message: context =>
                this.game.addMessage('{0} gains 1 GR thanks to the {1}', context.player, this),
            handler: () => {
                this.controller.modifyGhostRock(1);
            }
        });
    }
}

EvanLucas.code = '22015';

module.exports = EvanLucas;
