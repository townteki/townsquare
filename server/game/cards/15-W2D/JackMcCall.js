const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JackMcCall extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Jack McCall',
            playType: ['shootout'],
            ifCondition: context => {
                if(!this.game.shootout) {
                    return false;
                }
                return this.game.shootout.getPosseSize(context.player) > this.game.shootout.getPosseSize(context.player.getOpponent());
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but nothing happens because he is a coward and his posse does not have more dudes', 
                    context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: this }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setAsStud()
                    }));
                });
                this.game.addMessage('{0} uses {1} and gives him +1 bounty to make him a stud', context.player, this);
            }
        });
    }
}

JackMcCall.code = '23023';

module.exports = JackMcCall;
