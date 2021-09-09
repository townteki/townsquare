const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class JiaMein2 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Jia Mein',
            playType: ['shootout'],
            repeatable: true,
            target: {
                activePromptTitle: 'Select hex to attach to ' + this.title,
                cardCondition: { location: 'hand', condition: card => card.isHex() },
                cardType: ['spell']
            },
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                    playType: 'ability',
                    abilitySourceType: 'card',
                    targetParent: this
                }, () => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setAsStud()
                    }));
                    this.game.addMessage('{0} uses {1} to learn {2} and make {1} a stud', context.player, this, context.target);
                }), context.player, context.target);
            }
        });
    }
}

JiaMein2.code = '25038';

module.exports = JiaMein2;
