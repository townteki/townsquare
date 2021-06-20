const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class ImYourHuckleberry extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'I\'m Your Huckleberry',
            playType: ['cheatin resolution'],
            target: {
                choosingPlayer: 'thisIfLegal',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: 'dude'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to take control of {2}', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.takeControl(context.player)
                }));
                this.game.once('onShootoutPhaseFinished', () => {
                    if(context.target.location === 'play area') {
                        this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} is sending {1} home booted due to {2}', context.player, context.target, this);
                        });
                    }
                });
            }
        });
    }
}

ImYourHuckleberry.code = '20053';

module.exports = ImYourHuckleberry;
