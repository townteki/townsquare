const ActionCard = require('../../actioncard.js');

class SiegeOfTheOrphanage extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Siege of the Orphanage',
            playType: ['shootout'],
            message: context => {
                const shootoutLoc = this.game.shootout.shootoutLocation.locationCard;
                if(!shootoutLoc.owner) {
                    this.game.addMessage('{0} uses {1}, but there is no owner of the {2} thus it has no effect', 
                        context.player, this, shootoutLoc);
                } else {
                    this.game.addMessage('{0} uses {1} to make all {2}\'s dudes at {3} studs. Those dudes cannot flee the shootout ' +
                    'and {2} suffers one less casualty each round', context.player, this, shootoutLoc.owner, shootoutLoc);
                }
            },
            handler: context => {
                const shootoutLoc = this.game.shootout.shootoutLocation.locationCard;
                if(!shootoutLoc.owner) {
                    return;
                }
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout.getPosseByPlayer(shootoutLoc.owner).getDudes(),
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.cannotFlee()
                    ]
                }));
                const eventHandler = () => {
                    this.owner.modifyCasualties(-1);
                };
                this.game.on('onShootoutCasualtiesStepStarted', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => {
                    this.game.removeListener('onShootoutCasualtiesStepStarted', eventHandler);
                });
            }
        });
    }
}

SiegeOfTheOrphanage.code = '16019';

module.exports = SiegeOfTheOrphanage;
