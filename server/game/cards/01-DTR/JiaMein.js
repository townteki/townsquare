const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class JiaMein extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Jia Mein',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select hex to attach to ' + this.title,
                cardCondition: { location: 'hand', condition: card => card.isHex() },
                cardType: ['spell']
            },
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                    playType: 'ability',
                    sourceType: 'ability',
                    targetParent: this
                }, () => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setAsStud()
                    }));
                    this.game.addMessage('{0} uses {1} to learn {2} and make him a stud.', context.player, this, context.target);
                }), context.player, context.target);
            }
        });
    }
}

JiaMein.code = '01013';

module.exports = JiaMein;
