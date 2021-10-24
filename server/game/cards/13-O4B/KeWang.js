const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class KeWang extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Ke Wang',
            playType: ['shootout'],
            cost: ability.costs.payGhostRock(context => context.target.upkeep, true, 
                context => this.minUpkeepInPosse(context)),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: (card, context) => 
                        context.player.getSpendableGhostRock({ 
                            activePlayer: context.player,
                            context 
                        }) >= card.upkeep
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and pays {2} GR to give {3} -1 bullets', 
                    context.player, this, context.target.upkeep, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
            }
        });
    }

    minUpkeepInPosse(context) {
        if(!this.game.shootout) {
            return 0;
        }
        const oppPosse = this.game.shootout.getPosseByPlayer(context.player.getOpponent());
        if(!oppPosse) {
            return 0;
        }
        return oppPosse.getDudes().reduce((minUpkeep, dude) => {
            if(dude.upkeep > minUpkeep) {
                return minUpkeep;
            }
            return dude.upkeep;
        }, 999);
    }
}

KeWang.code = '21008';

module.exports = KeWang;
