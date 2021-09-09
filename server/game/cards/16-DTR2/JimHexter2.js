const DudeCard = require('../../dudecard.js');

class JimHexter2 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Jim Hexter',
            playType: ['shootout'],
            condition: () => this.controller.getSpendableGhostRock() > 0,
            message: context => 
                this.game.addMessage('{0} uses {1} to pay {2} 1 GR to make {1} a stud', context.player, this, context.player.getOpponent()),
            handler: context => {
                this.game.transferGhostRock({ from: context.player, to: context.player.getOpponent(), amount: 1});
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
                this.game.once('onShootoutPhaseFinished', () => context.ability.resetAbilityUsage());
            }
        });
    }
}

JimHexter2.code = '25010';

module.exports = JimHexter2;
