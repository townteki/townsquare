const DudeCard = require('../../dudecard.js');

/** @typedef {import('../../AbilityDsl')} AbilityDsl */
class ShelbyHunt extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Shelby Hunt',
            playType: 'shootout',
            ifCondition: () => this.opposingPosseContainsDudeWithHigherBullets(),
            message: context => 
                this.game.addMessage('{0} uses {1} to increase bullets and become a stud. {1} cannot be chosen or affected by their opponent\'s abilities', 
                    context.player, this),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but there are no opposing dudes with higher bullets',
                    context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.modifyBullets(1),
                        ability.effects.setAsStud(),
                        ability.effects.cannotBeAffectedByShootout('opponent')
                    ]
                }));
            }
        });
    }

    opposingPosseContainsDudeWithHigherBullets() {
        if(!this.game.shootout) {
            return false;
        }
        const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!oppPosse) {
            return false;
        }
        return oppPosse.getDudes(dude => dude.bullets > this.bullets).length > 0;
    }
}

ShelbyHunt.code = '12010';

module.exports = ShelbyHunt;
