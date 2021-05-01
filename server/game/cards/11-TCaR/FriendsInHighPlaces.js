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
                this.lastingEffect(ability => ({
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
            ifCondition: () => this.getPosseInfluence(this.controller) > this.getPosseInfluence(this.controller.getOpponent()),
            ifFailMessage: context => {
                this.game.addMessage('{0} uses {1} but does not make anyone a stud because their posse\'s total influence is less than the opposing posse\'s', context.player, this);
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a dude to make a stud',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: { location: 'play area', controller: context.player, 
                        condition: card => card.isParticipating() && card.isDraw()},
                    cardType: 'dude',
                    onSelect: (player, dudeToStud) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: dudeToStud,
                            effect: ability.effects.setAsStud()
                        }));
                        this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, dudeToStud);
                        return true;
                    }
                });
            }
        });
    }

    getPosseInfluence(player) {
        let playerPosseDudes = this.game.shootout.getPosseByPlayer(player).getDudes();
        return playerPosseDudes.reduce((memo, dude) => memo + dude.influence, 0);
    }
}

FriendsInHighPlaces.code = '19043';

module.exports = FriendsInHighPlaces;
