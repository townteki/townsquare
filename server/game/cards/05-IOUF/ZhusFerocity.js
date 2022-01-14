const TechniqueCard = require('../../techniquecard.js');

class ZhusFerocity extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Zhu\'s Ferocity',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            combo: context => {
                if(!this.comboTarget) {
                    return false;
                }
                return context.kfDude.bullets > this.comboTarget.bullets;
            },
            onSuccess: context => {
                this.comboTarget = context.target;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.kfDude,
                    effect: ability.effects.modifyBullets(1)
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
                this.game.addMessage('{0} uses {1} to give {2} -1 bullet and {3} +1 bullet', 
                    context.player, this, context.target, context.kfDude);
                return true;
            },
            source: this
        });
    }
}

ZhusFerocity.code = '09037';

module.exports = ZhusFerocity;
