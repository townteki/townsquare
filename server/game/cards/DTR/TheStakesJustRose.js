const DrawCard = require('../../drawcard.js');
const GameActions = require('../../GameActions/index.js');

class TheStakesJustRose extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'The Stakes Just Rose',
            playType: 'shootout:join',
            target: {
                cardCondition: { location: 'play area', participating: false, controller: 'current'},
                cardType: 'dude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse( { card: context.target }));
                context.target.untilEndOfShootoutPhase(ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
                this.game.addMessage('{0} plays {1} to bring {2} into posse and make them a stud', context.player, this, context.target);
            }
        });
    } 
}

TheStakesJustRose.code = '01112';

module.exports = TheStakesJustRose;