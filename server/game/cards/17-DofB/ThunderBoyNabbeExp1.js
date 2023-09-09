const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ThunderBoyNabbeExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: "Thunder Boy" Nabbe Exp 1',
            playType: ['shootout'],
            cost: [
                ability.costs.boot(card => 
                    (card.equals(this) || card.hasKeyword('blessed')) &&
                    card.isParticipating())
            ],
            target: {
                activePromptTitle: 'Select dude to set to draw',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    wanted: true
                },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsDraw()
                }));
                if(this.equals(context.costs.boot)) {
                    this.game.addMessage('{0} uses {1} and boots himself to make {2} a draw', context.player, this, context.target);
                } else {
                    this.game.addMessage('{0} uses {1} and boots {2} to make {3} a draw', context.player, this, context.costs.boot, context.target);
                }
            }
        });
    }
}

ThunderBoyNabbeExp1.code = '25019';

module.exports = ThunderBoyNabbeExp1;
