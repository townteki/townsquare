const DudeCard = require('../../dudecard.js');

class Ruckus extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isAtDeed(),
            match: this,
            effect: ability.effects.determineControlByBullets()
        });

        this.action({
            title: 'Ruckus',
            playType: ['shootout'],
            ifCondition: () => {
                if(!this.game.shootout) {
                    return false;
                }
                const ruckusOppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
                if(!ruckusOppPosse) {
                    return false;
                }
                return this.isParticipating() && ruckusOppPosse.getDudes().length === 1;
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not have any effect becaue there is more than one dude in opposing posse', 
                    context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to make {1} a stud', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

Ruckus.code = '25082';

module.exports = Ruckus;
