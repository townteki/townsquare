const SpellCard = require('../../spellcard.js');

class StrengthOfTheAncestors extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Strength of the Ancestors',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                this.guardedLocation = this.gamelocation;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.modifyBullets(3),
                        ability.effects.setAsStud(),
                        ability.effects.cannotBeBooted('opponent'),
                        ability.effects.cannotBeSentHome('opponent')
                    ]
                }));
                this.game.onceConditional('onDudeLeftLocation', { condition: event => event.card === this.parent }, 
                    () => this.game.effectEngine.unapplyAndRemove(effect => effect.source === this));
            },
            source: this
        });
    }
}

StrengthOfTheAncestors.code = '10029';

module.exports = StrengthOfTheAncestors;
