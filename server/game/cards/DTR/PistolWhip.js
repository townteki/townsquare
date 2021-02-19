const ActionCard = require('../../actioncard.js');

class PistolWhip extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Pistol Whip',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.getType() === 'dude' &&
                card.isParticipating()
            ),
            target: {
                activePromptTitle: 'Select dude to whip',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.costs.boot,
                    effect: ability.effects.modifyBullets(-1)
                }));
                this.game.shootout.sendHome(context.target);
                this.game.addMessage('{0} uses {1} to send {2} home booted.', context.player, this);
            }
        });
    }
}

PistolWhip.code = '01119';

module.exports = PistolWhip;
