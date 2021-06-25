const DudeCard = require('../../dudecard.js');

class VirginiaAnnEarp extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: this.game.getPlayers(),
            effect: [
                ability.effects.cannotModifyHandRanks(this, context => context.ability && 
                    ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context)))
            ]
        });
    }
}

VirginiaAnnEarp.code = '20030';

module.exports = VirginiaAnnEarp;
