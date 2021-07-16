const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Censure extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Censure',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            choosePlayer: true,
            difficulty: 6,
            onSuccess: (context) => {
                this.game.promptForYesNo(context, {
                    title: 'Increase handrank?',
                    onYes: context => {
                        context.chosenPlayer.modifyRank(2, context);
                        this.game.addMessage('{0} uses {1} to increase {2}\'s hand rank by 2', context.player, this, context.chosenPlayer);
                    }
                });
                /* Check if this is a shootout and if so, reduce casualties */
                if(this.game.shootout) {
                    context.player.modifyCasualties(-3);
                    this.game.addMessage('{0} uses {1} to reduce their casualties by 3 this round', context.player, this);
                }
                this.game.promptForYesNo(context, {
                    title: 'Send dude home booted?',
                    onYes: context => {
                        this.game.promptForSelect(context.player, {
                            activePromptTitle: 'Select dude to send home booted',
                            waitingPromptTitle: 'Waiting for opponent to select dude',
                            cardCondition: card => card.getType() === 'dude' && card.location === 'play area' && card.isOpposing(context.player),
                            cardType: 'dude',
                            gameAction: 'sendHome',
                            onSelect: (card) => {
                                this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, card);
                                this.game.shootout.sendHome(card, context);
                                return true;
                            }
                        });
                    }
                });
            },
            source: this
        });
    }
}

Censure.code = '19035';

module.exports = Censure;
