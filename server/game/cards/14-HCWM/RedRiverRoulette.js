const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class RedRiverRoulette extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Red River Roulette',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                if(!context.player.isCheatin()) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose a dude',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller === context.player && 
                            card.gamelocation === this.gamelocation,
                        cardType: 'dude',
                        gameAction: 'boot',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                                this.game.getPlayers().forEach(player => player.modifyCasualties(-999));
                                this.game.addMessage('{0} uses {1} and boots {2} to prevent all casualties', 
                                    player, this, card);
                            });
                            return true;
                        }
                    });
                } else {
                    this.game.addMessage('{0} uses {1} but it does not have any effect because they do not have a legal hand', 
                        context.player, this);
                }
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: this.game.shootout.getParticipants(),
                    effect: ability.effects.cannotFlee()
                }));
                const eventHandler = () => {
                    this.game.getPlayers().forEach(player => player.modifyCasualties(player.casualties));
                };
                const currentShootoutRound = this.game.shootout.round;
                this.game.onceConditional('onShootoutCasualtiesStepStarted', { 
                    until: 'onShootoutPhaseFinished',
                    condition: event => event.shootoutRound === currentShootoutRound + 1 
                }, eventHandler);
            }
        });
    }
}

RedRiverRoulette.code = '22032';

module.exports = RedRiverRoulette;
