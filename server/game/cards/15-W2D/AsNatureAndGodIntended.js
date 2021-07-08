const ActionCard = require('../../actioncard.js');

class AsNatureAndGodIntended extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'As Nature and God Intended',
            playType: ['shootout'],
            message: context =>
                this.game.addMessage(' {0} uses {1} to disable all Weapons and make all Kung Fu dudes studs until end of this shootout round', context.player, this),
            handler: context => {
                // All Weapons lose their bullet bonuses, traits, and Shootout abilities until the end of this round of the shootout.
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    condition: () => this.game.shootout,
                    match: card => card.getType() === 'goods' && card.hasKeyword('weapon') && card.parent && card.parent.isParticipating(),
                    targetController: 'any',
                    effect: [
                        ability.effects.traitBlank,
                        ability.effects.bulletBonusBlank,
                        ability.effects.cannotTriggerCardAbilities(ability => ability.playType && ability.playType.includes('shootout'))
                    ]
                }), context.causedByPlayType);

                // Dudes with Kung Fu are studs until the end of this round of the shootout.
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    condition: () => this.game.shootout,
                    targetController: 'any',
                    match: card => card.getType() === 'dude' && card.hasKeyword('kung fu') && card.isParticipating(),
                    effect: ability.effects.setAsStud()
                }), context.causedByPlayType);
            }
        }); 
    }
}

AsNatureAndGodIntended.code = '23050';

module.exports = AsNatureAndGodIntended;
