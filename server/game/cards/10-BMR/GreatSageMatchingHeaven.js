const TechniqueCard = require('../../techniquecard.js');

class GreatSageMatchingHeaven extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Great Sage Matching Heaven',
            playType: ['shootout'],
            combo: () =>
                this.game.shootout.getPosseStat(this.controller, 'influence') >= this.game.shootout.getPosseStat(this.controller.getOpponent(), 'influence'),
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.kfDude,
                    effect: [
                        ability.effects.modifyInfluence(1),
                        ability.effects.addKeyword('harrowed')
                    ]
                }));
                this.game.addMessage('{0} uses {1} to give {2} +1 influence and Harrowed keyword', context.player, this, context.kfDude);
            },
            source: this
        });
    }
}

GreatSageMatchingHeaven.code = '18037';

module.exports = GreatSageMatchingHeaven;
