const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Censure extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Censure',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.abilityContext = context;
                context.game.promptForYesNo(this.controller, {
                    title: 'Increase hand rank?',
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
                    },
                    source: this
                });
                
                /* Check if this is a shootout and if so, reduce casualties */
                if(this.game.shootout) {
                    this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                        player: context.player,
                        amount: 3
                    }), context);               
                    context.game.promptForYesNo(this.controller, {
                        title: 'Send dude home booted?',
                        onYes: () => {
                            context.ability.selectAnotherTarget(this.controller, context, {
                                activePromptTitle: 'Select dude to send home booted',
                                waitingPromptTitle: 'Waiting for opponent to select dude',
                                cardCondition: card => card.location === 'play area' && card.isOpposing(this.controller),
                                cardType: 'dude',
                                gameAction: ['sendHome', 'boot'],
                                onSelect: (player, card) => {
                                    this.game.addMessage('{0} uses {1} to reduce their casualties by 3 this round and to send {2} home booted', 
                                        player, this, card);
                                    this.game.shootout.sendHome(card, context);
                                    return true;
                                }
                            });
                            return true;
                        },
                        onNo: () => {
                            this.game.addMessage('{0} uses {1} to reduce their casualties by 3 this round', context.player, this);
                        },
                        source: this
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
        this.game.addMessage('{0} uses {1} to raise {2}\'s hand rank by 2', player, this, player.getOpponent());
        return true;
    }
}

Censure.code = '19035';

module.exports = Censure;
