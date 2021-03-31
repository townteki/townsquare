const ActionCard = require('../../actioncard.js');

class FriendsInHighPlaces extends ActionCard {
    setupCardAbilities() {
        this.reaction({
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
                this.lastingEffect(ability => ({
                    until: {
                        onCardCallOutFinished: () => true
                    },
                    match: context.event.callee,
                    effect: ability.effects.canRefuseWithoutGoingHomeBooted()
                }));
            }
        });
    }
}

FriendsInHighPlaces.code = '19043';

module.exports = FriendsInHighPlaces;
