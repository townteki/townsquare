const ActionCard = require('../../actioncard.js');

class FriendsInHighPlaces extends ActionCard {
    setupCardAbilities() {
        this.reaction({
            title: 'React: Friends in High Places',
            when: {
                onDudeCalledOut: event => 
                    event.callee.controller === this.controller &&
                    event.callee.influence > event.caller.influence &&
                    !event.callee.booted &&
                    event.canReject === true
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to refuse the callout without moving home booted', context.player, this);
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onCardCallOutFinished: () => true
                    },
                    match: context.event.callee,
                    effect: ability.effects.canRefuseWithoutGoingHomeBooted()
                }));
            }
        });

        this.action({
            title: 'Shootout: Friends in High Places',
            playType: 'shootout',
            ifCondition: () => 
                this.game.shootout.getPosseStat(this.controller, 'influence') > this.game.shootout.getPosseStat(this.controller.getOpponent(), 'influence'),
            ifFailMessage: context => {
                this.game.addMessage('{0} uses {1} but does not make anyone a stud because their posse\'s total influence is less than the opposing posse\'s', 
                    context.player, this);
            },
            target: {
                activePromptTitle: 'Select a dude to make a stud',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true,
                    condition: card => card.isDraw()
                },
                cardType: ['dude'],
                ifAble: true
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
                this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, context.target);
            }
        });
    }
}

FriendsInHighPlaces.code = '19043';

module.exports = FriendsInHighPlaces;
