const SpellCard = require('../../spellcard.js');

class BloodCurse2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Blood Curse',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to be cursed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.isNearby(this.gamelocation)
                },
                cardType: ['dude']
            },
            difficulty: 9,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-1),
                        ability.effects.modifyInfluence(-1)
                    ]
                }));
                this.game.addMessage('{0} uses {1} to curse {2} who gets -1 influence and -1 bullets', context.player, this, context.target);           
            },
            source: this
        });
    }
}

BloodCurse2.code = '24189';

module.exports = BloodCurse2;
