const DudeCard = require('../../dudecard.js');

class GeneNorthStar extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Gene North Star',
            playType: ['shootout'],
            cost: ability.costs.discardFromPlay(card => 
                card.parent === this &&
                card.hasKeyword('spirit')),
            message: context => this.game.addMessage('{0} uses {1}, discarding his {2} to give him +2 bullets', 
                context.player, this, context.costs.discardFromPlay),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(2)
                }));
            }
        });
    }
}

GeneNorthStar.code = '17003';

module.exports = GeneNorthStar;
