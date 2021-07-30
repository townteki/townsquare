const SpellCard = require('../../spellcard.js');

class Censure extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Censure',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                context.game.promptForYesNo(this.controller, {
                    title: 'Increase handrank?',
                    onYes: () => {
                        this.game.promptWithMenu(context.player, this, {
                            activePrompt: {
                                menuTitle: 'Which player?',
                                buttons: [
                                    {
                                        text: context.player.name,
                                        method: 'chooseMe'
                                    },
                                    {
                                        text: context.player.getOpponent().name,
                                        method: 'chooseOpponent'
                                    }
                                ]
                            },
                            source: this
                        });
                    }
                });
                
                /* Check if this is a shootout and if so, reduce casualties */
                if(this.game.shootout) {
                    context.player.modifyCasualties(-3);
                    this.game.addMessage('{0} uses {1} to reduce their casualties by 3 this round', context.player, this);
                    
                    context.game.promptForYesNo(this.controller, {
                        title: 'Send dude home booted?',
                        onYes: () => {
                            context.game.promptForSelect(this.controller, {
                                activePromptTitle: 'Select dude to send home booted',
                                waitingPromptTitle: 'Waiting for opponent to select dude',
                                cardCondition: card => card.location === 'play area' && card.isOpposing(this.controller),
                                cardType: 'dude',
                                gameAction: 'sendHome',
                                onSelect: (player, card) => {
                                    this.game.addMessage('{0} uses {1} to send {2} home booted', player, this, card);
                                    this.game.shootout.sendHome(card, context);
                                    return true;
                                }
                            });
                            return true;
                        }
                    });
                }
            },
            source: this
        });
    }

    chooseMe(player) {
        player.modifyRank(2, this.abilityContext);
        this.game.addMessage('{0} uses {1} to raise their hand rank by 2', player, this);
        return true;
    }

    chooseOpponent(player) {
        player.getOpponent().modifyRank(2, this.abilitycontext);
        this.game.addMessage('{0} uses {1} to raise {3}\'s hand rank by 2', player, this, player.getOpponent());
        return true;
    }
}

Censure.code = '19035';

module.exports = Censure;
