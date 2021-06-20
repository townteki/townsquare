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
                        cardCondition: { 
                            location: 'play area', 
                            controller: 'current', 
                            condition: card => card.gamelocation === this.gamelocation 
                        },
                        cardType: 'dude',
                        gameAction: 'boot',
                        onSelect: (player, card) => {
                            this.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                                this.lastingEffect(ability => ({
                                    until: {
                                        onShootoutRoundFinished: () => true,
                                        onShootoutPhaseFinished: () => true
                                    },
                                    match: this.game.getPlayers(),
                                    effect: ability.effects.preventCasualties()
                                }));
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
                this.lastingEffect(ability => ({
                    until: {
                        onShootoutRoundFinished: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.game.shootout.getParticipants(),
                    effect: ability.effects.cannotFlee()
                }));
                const eventHandler = () => {
                    this.lastingEffect(ability => ({
                        until: {
                            onShootoutRoundFinished: () => true,
                            onShootoutPhaseFinished: () => true
                        },
                        match: this.game.getPlayers(),
                        effect: ability.effects.doubleCasualties()
                    }));
                };
                this.game.once('onShootoutRoundStarted', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => 
                    this.game.removeListener('onShootoutRoundStarted', eventHandler));
            }
        });
    }
}

RedRiverRoulette.code = '22032';

module.exports = RedRiverRoulette;
