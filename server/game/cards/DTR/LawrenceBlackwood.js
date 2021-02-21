const DudeCard = require('../../dudecard.js');

class LawrenceBlackwood extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Lawrence Blackwood',
            playType: 'noon',
            condition: () => this.locationCard.owner !== this.controller,
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    until: {
                        onDudeMoved: event => event.card === this
                    },
                    match: this,
                    effect: [
                        ability.effects.modifyControl(1)
                    ]
                }));
                this.game.addMessage('{0} uses {1} to gain control point unless he moves.', context.player, this);
            }
        });
    }
}

LawrenceBlackwood.code = '01037';

module.exports = LawrenceBlackwood;
