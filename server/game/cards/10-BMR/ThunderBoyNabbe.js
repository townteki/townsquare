const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ThunderBoyNabbe extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: "Thunder Boy" Nabbe',
            playType: ['shootout'],
            repeatable: true,
            limit: 1,
            ifCondition: () => {
                const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
                if(!oppPosse) {
                    return false;
                }
                return oppPosse.getDudes().some(dude => dude.isWanted());
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but there is no opposing wanted dude', 
                    context.player, this),
            message: context => 
                this.game.addMessage('{0} uses {1} to get {2} bullets and becomes a stud', 
                    context.player, this, this.influence),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.modifyBullets(this.influence)
                    ]
                }));
            }
        });
    }
}

ThunderBoyNabbe.code = '18041';

module.exports = ThunderBoyNabbe;
