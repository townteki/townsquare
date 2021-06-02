const TechniqueCard = require('../../techniquecard.js');

class ZhusFerocity extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Zhu\'s Ferocity',
            playType: ['shootout'],
            combo: context => {
                if(!context.zhusTarget) {
                    return false;
                }
                return context.kfDude.bullets > context.zhusTarget.bullets;
            },
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.kfDude,
                    effect: ability.effects.modifyBullets(1)
                }));
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select an opposing dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.controller !== this.owner && card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        context.zhusTarget = dude;
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: dude,
                            effect: ability.effects.modifyBullets(-1)
                        }));
                        return true;
                    },
                    source: this
                });
            },
            source: this
        });
    }
}

ZhusFerocity.code = '09037';

module.exports = ZhusFerocity;
