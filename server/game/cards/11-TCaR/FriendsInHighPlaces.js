const ActionCard = require('../../actioncard.js');

class FriendsInHighPlaces extends ActionCard {
    countPosseInfluence(posse) {
        let totalInfluence = 0;
        posse.forEach(dudeUuid => {
            let dude = this.game.findCardInPlayByUuid(dudeUuid);
            let amount = dude.getStat('influence');
            totalInfluence = totalInfluence + amount;
            return totalInfluence;
        });
    }

    getPosseInfluences(context) {
        let playerPosseDudes = this.game.shootout.getPosseByPlayer(context.player).getDudes();
        let opponentPosseDudes = this.game.shootout.getPosseByPlayer(context.player.getOpponent()).getDudes();
        let playerPosseInfluence = this.countPosseInfluence(playerPosseDudes);
        let opponentPosseInfluence = this.countPosseInfluence(opponentPosseDudes);
        let greaterInfluence = playerPosseInfluence > opponentPosseInfluence;
        return greaterInfluence;
    }

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
        this.action({
            title: 'Shootout: Friends in High Places',
            playType: 'shootout',
            //condition: context => this.getPosseInfluences(context),
            handler: context => {
                this.game.promptForSelect({
                    activeTitlePrompt: 'Select a dude to make a stud',
                    waitingTitlePrompt: 'Waiting for opponent to select a dude',
                    cardCondition: { location: 'play area', controller: this.controller, 
                        condition: card => card.isParticipating},
                    cardType: 'dude',
                    onSelect: (dudeToStud) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: dudeToStud,
                            effect: [
                                ability.effects.setAsStud()
                            ]
                        }));
                        this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, dudeToStud);
                    }
                });
            }
        });
    }
}

FriendsInHighPlaces.code = '19043';

module.exports = FriendsInHighPlaces;
