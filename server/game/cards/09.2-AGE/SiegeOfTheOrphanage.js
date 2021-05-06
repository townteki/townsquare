const ActionCard = require('../../actioncard.js');

class SiegeOfTheOrphanage extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Siege of the Orphanage',
            playType: ['shootout'],
            message: context => 
                this.game.addMessage('{0} uses {1} to make all {2}\'s dudes at {3} studs. Those dudes cannot flee the shootout ' +
                    'and {2} suffers one less casualty each round', context.player, this, this.game.shootout.shootoutLocation.locationCard),
            handler: context => {
                const shootoutLoc = this.game.shootout.shootoutLocation.locationCard;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout.getPosseByPlayer(shootoutLoc.owner).getDudes(),
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

SiegeOfTheOrphanage.code = '16019';

module.exports = SiegeOfTheOrphanage;
