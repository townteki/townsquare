const SpellCard = require('../../spellcard.js');

class Bedazzle extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Bedazzle',
            playType: 'cheatin resolution',
            cost: ability.costs.bootSelf(),
            difficulty: 3,
            choosePlayer: true,
            onSuccess: (context) => {
                context.chosenPlayer.modifyRank(-2, context);
                this.game.addMessage('{0} uses {1} to lower {2}\'s draw hand by 2 ranks; Current rank is {3}',
                    context.player, this, context.chosenPlayer, context.chosenPlayer.getTotalRank());
                if(this.game.shootout) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose opposing dude to bedazzle',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller === context.player.getOpponent() &&
                            card.isParticipating(),
                        cardType: 'dude',
                        onSelect: (p, dazzlee) => {
                            const dazzleAmount = dazzlee.bullets;
                            ability.effects.modifyBullets(-dazzleAmount);
                            this.game.addMessage('{0} gives {1} -{2} bullets with the {3}', context.player, dazzlee, dazzleAmount, this);
                        },
                        source: this
                    });
                }
            },
            source: this
        });
    }
}

Bedazzle.code = '20043';

module.exports = Bedazzle;
