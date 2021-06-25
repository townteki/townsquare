const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class GrimServantODeath extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Grim Servant O\'Death',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => !card.isParticipating() &&
                        card.isAtHome() &&
                        card.controller === this.game.shootout.opposingPlayer
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                this.game.promptForYesNo(context.target.controller, {
                    title: `Do you want to have ${context.target.title} join the posse?`,
                    onYes: player => {
                        this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to lure {2} into posse, and {3} decides to join them', 
                                context.player, this, context.target, player);
                        });
                    },
                    onNo: () => {
                        context.ability.selectAnotherTarget(context.player, context, {
                            activePromptTitle: 'Select your dude',
                            waitingPromptTitle: 'Waiting for opponent to select card',
                            cardCondition: card => card.isParticipating() && card.controller === context.player,
                            cardType: 'dude',
                            onSelect: (player, card) => {
                                this.applyAbilityEffect(context.ability, ability => ({
                                    match: card,
                                    effect: [
                                        ability.effects.setAsStud(),
                                        ability.effects.modifyBullets(2)
                                    ]
                                }));
                                this.game.addMessage('{0} uses {1}, but {2} decides not to join {3} to posse and therefore {4} becomes stud and gets +2 bullets', 
                                    context.player, this, context.target.controller, context.target, card);
                                return true;
                            },
                            source: this
                        });
                        this.game.onceConditional('onHandResultDetermined', { 
                            until: 'onShootoutRoundFinished',
                            condition: event => event.player === context.player.getOpponent() && context.player.getOpponent().isCheatin()
                        }, event => {
                            event.player.modifyCasualties(2);
                            this.game.addMessage('{0} will take 2 extra casualties as a punishment by {1} for his cheatin\' hand', 
                                event.player, this);
                        });
                    },
                    source: this
                });
            }
        });
    }
}

GrimServantODeath.code = '19040';

module.exports = GrimServantODeath;
