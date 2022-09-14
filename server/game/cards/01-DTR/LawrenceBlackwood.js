const DudeCard = require('../../dudecard.js');

class LawrenceBlackwood extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Lawrence Blackwood',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.locationCard.owner !== this.controller && this.isAtDeed(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but does not gain any CP because he is not at deed {0} does not own', 
                    context.player, this),
            message: context =>
                this.game.addMessage('{0} uses {1} to gain CP unless he moves', context.player, this),
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
            }
        });
    }
}

LawrenceBlackwood.code = '01037';

module.exports = LawrenceBlackwood;
