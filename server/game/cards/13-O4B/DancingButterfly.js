const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class DancingButterfly extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Dancing Butterfly',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 10,
            onSuccess: (context) => {
                if(!context.player.isCheatin()) {
                    this.game.promptForYesNo(context.player.getOpponent(), {
                        title: `Do you want to cancel ${this.title} effects?`,
                        onYes: player => {
                            this.game.promptForSelect(player, {
                                activePromptTitle: 'Select a dude to send home',
                                waitingPromptTitle: 'Waiting for opponent to select dude',
                                cardCondition: card => card.location === 'play area' &&
                                    card.controller === player &&
                                    card.isParticipating(),
                                cardType: 'dude',
                                gameAction: 'sendHome',
                                onSelect: (p1, dude) => {
                                    this.game.resolveGameAction(GameActions.sendHome({ card: dude }), context);
                                    this.game.promptForSelect(p1, {
                                        activePromptTitle: 'Select a deed to give +1 CP',
                                        waitingPromptTitle: 'Waiting for opponent to select deed',
                                        cardCondition: card => card.location === 'play area' && card.owner === context.player,
                                        cardType: 'deed',
                                        onSelect: (p2, deed) => {
                                            deed.modifyControl(1);
                                            this.game.addMessage('{0} uses {1} but {2} cancels its effects by sending {3} home and giving {4} +1 CP', 
                                                context.player, this, p2, dude, deed);
                                            return true;
                                        }
                                    });
                                    return true;
                                }
                            });
                        },
                        onNo: () => {
                            this.lastingEffect(context.ability, ability => ({
                                until: {
                                    onShootoutRoundFinished: () => true
                                },
                                match: this.controller,
                                effect: ability.effects.increaseMaxCheatin(1)
                            }));
                            this.game.addMessage('{0} uses {1} and may make second Cheatin\' Resolution play', context.player, this);
                        },
                        source: this
                    });
                } else {
                    this.game.addMessage('{0} uses {1} but it does not have any effect because their hand is not legal', 
                        context.player, this, context.target);
                }
            },
            source: this
        });
    }
}

DancingButterfly.code = '21051';

module.exports = DancingButterfly;
