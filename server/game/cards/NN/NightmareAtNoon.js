const ActionCard = require('../../actioncard.js');

class NightmareAtNoon extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Nightmare At Noon',
            playType: ['shootout'],
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    targetController: 'opponent',
                    match: card => card.getType() === 'dude' && card.isOpposing(context.player),
                    effect: [
                        ability.effects.modifyBullets(-1)
                    ]
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    targetController: 'any',
                    match: card => card.getType() === 'dude' && card.isParticipating() && card.bullets < 2,
                    effect: [
                        ability.effects.setAsDraw()
                    ]
                }));
                this.game.addMessage('{0} uses {1} to give one posse -1 bullets and make all dudes with 0 or 1 bullets draws.', 
                    context.player, this);
            }
        });
    }
}

NightmareAtNoon.code = '08021';

module.exports = NightmareAtNoon;
