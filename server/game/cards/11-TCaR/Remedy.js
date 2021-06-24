const SpellCard = require('../../spellcard.js');

class Remedy extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Remedy',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            difficulty: 7,
            onSuccess: (context) => {
                this.removeEffects(effect => (effect.gameAction === 'increaseBullets' ||
                    effect.gameAction === 'decreaseBullets') &&
                    effect.source.getType() !== 'goods' && !effect.source.hasKeyword('weapon')
                );
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPhaseFinished: () => true
                    },
                    condition: () => this.isParticipating(),
                    match: this,
                    effect: ability.effects.modifyBullets(-this.permanentBullets)
                }));  
            },
            source: this
        });
    }
}

Remedy.code = '19037';

module.exports = Remedy;
