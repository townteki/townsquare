const DudeCard = require('../../dudecard.js');

class EnriqueDosSantos extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'React: Enrique Dos Santos',
            when: {
                onDudeAcceptedCallOut: event => event.caller === this &&
                    event.callee.isWanted() &&
                    !event.callee.isAtHome()
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent other dudes from joining mark\'s posse', 
                    context.player, this),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPossesGathered: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: context.event.callee.controller,
                    effect: ability.effects.otherDudesCannotJoin()
                }));                
            }
        });
    }
}

EnriqueDosSantos.code = '21023';

module.exports = EnriqueDosSantos;
