const DrawCard = require('../../drawcard.js');

class TheStakesJustRose extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'The Stakes Just Rose',
            playType: 'shootout',
            target: {
                cardCondition: { location: 'play area', participating: false, controller: 'choosingPlayer'},
                cardType: 'dude'
            },
            handler: context => {
                this.game.shootout.addToPosse(context.target);
                context.target.moveToShootoutLocation(false, true);
                context.target.untilEndOfShootout(ability => ({
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