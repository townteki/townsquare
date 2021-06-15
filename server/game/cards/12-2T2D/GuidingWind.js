const SpellCard = require('../../spellcard.js');

class GuidingWind extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Modify Bullets',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 8,
            target: {
                activePromptTitle: 'Select a dude',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: {
                    location: 'play area',
                    condition: card => card.isOpposing() || !card.hasKeyword('Token')
                },
                cardType: 'dude'
            },
            onSuccess: (context) => {
                const newBullets = context.target.influence > 3 ? 3 : context.target.influence;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setBullets(newBullets)
                }));
                this.game.addMessage('{0} uses {1} to set {2}\'s bullets to {3}', context.player, this, context.target, newBullets);
            }
        });
    }
}

GuidingWind.code = '20047';

module.exports = GuidingWind;
