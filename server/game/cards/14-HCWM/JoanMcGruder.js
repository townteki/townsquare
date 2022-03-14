const DudeCard = require('../../dudecard.js');

class JoanMcGruder extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.isParticipating(),
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => this.dudesInJoansPosse() * -1),
                ability.effects.cannotLeaveShootout(),
                ability.effects.cannotBeSentHome('any', () => this.isParticipating())
            ]
        });
        this.persistentEffect({
            targetController: 'opponent',
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.bounty <= card.influence,
            effect: [
                ability.effects.cannotBeAffected('opponent', context => context.ability && context.ability.card &&
                    context.ability.isCardAbility() && this.equals(context.ability.card.parent))
            ]
        });
    }

    dudesInJoansPosse() {
        if(!this.game.shootout) {
            return 0;
        }
        const joansPosse = this.game.shootout.getPosseByPlayer(this.controller);
        return joansPosse ? joansPosse.getDudes().length - 1 : 0;
    }
}

JoanMcGruder.code = '22021';

module.exports = JoanMcGruder;
