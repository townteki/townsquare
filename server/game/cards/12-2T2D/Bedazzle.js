const SpellCard = require('../../spellcard.js');
const GameActions = require('../../GameActions/index.js');

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
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Choose opposing dude to bedazzle',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller === context.player.getOpponent() &&
                            card.isParticipating(),
                        cardType: 'dude',
                        onSelect: (p, dazzlee) => {
                            const dazzleAmount = Math.max(dazzlee.bullets, 0);
                            ability.effects.modifyBullets(0-dazzleAmount);
                            this.game.addMessage({0} gets -{1} bullets due to the {2}, dazzlee, dazzleAmount, this);
                        }
                    });
                }
            },
            source: this
        });
    }
}

Bedazzle.code = '20043';

module.exports = Bedazzle;
