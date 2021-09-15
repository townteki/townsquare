const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class TheStakesJustRose extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'The Stakes Just Rose',
            playType: 'shootout:join',
            target: {
                cardCondition: { location: 'play area', participating: false, controller: 'current'},
                cardType: 'dude',
                gameAction: 'joinPosse'
            },
            message: context =>
                this.game.addMessage('{0} plays {1} to bring {2} into their posse and make them a stud', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    } 
}

TheStakesJustRose.code = '01112';

module.exports = TheStakesJustRose;
