const ActionCard = require('../../actioncard.js');

class MagicalDistraction extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Magical Distraction',
            playType: ['cheatin resolution'],
            cost: ability.costs.discardFromPlay(card => 
                card.location === 'play area' &&
                card.getType() === 'spell' &&
                card.parent.controller === this.controller &&
                card.parent.isParticipating()
            ),
            handler: context => {
                context.player.pull((pulledCard, pulledValue) => {
                    let currentRank = context.player.getTotalRank();
                    context.player.modifyRank(pulledValue - currentRank, context);
                    this.game.addMessage('{0} uses {1} to set their draw hand rank to {2}', 
                        context.player, this, context.player.getTotalRank());
                }, true, { context });
            }
        });
    }
}

MagicalDistraction.code = '01131';

module.exports = MagicalDistraction;
