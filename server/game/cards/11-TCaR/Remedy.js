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
                    effect.source.getType() !== 'goods' && 
                    !effect.source.hasKeyword('weapon') &&
                    effect.source.parent === context.target
                );
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPhaseFinished: () => true
                    },
                    condition: () => this.isParticipating(),
                    match: this,
                    effect: [
                        ability.effects.modifyBullets(-this.permanentBullets),
                        ability.effects.cannotLeaveShootout('any', context => context.ability && context.ability.isCardAbility())
                    ]
                }));  
                this.game.addMessage('{0} uses {1} to remove all bullet modifiers except attached weapons from {2}', 
                    context.player, this, context.target);
            },
            source: this
        });
    }
}

Remedy.code = '19037';

module.exports = Remedy;
