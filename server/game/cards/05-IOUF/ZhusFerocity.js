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
                return this.bullets > context.zhusTarget.bullets;
            },
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(1)
                }));
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        context.zhusTarget = dude;
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: dude,
                            effect: ability.effects.modifyBullets(-1)
                        }));
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

ZhusFerocity.code = '09037';

module.exports = ZhusFerocity;
