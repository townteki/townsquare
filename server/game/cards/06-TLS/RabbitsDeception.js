const TechniqueCard = require('../../techniquecard.js');

class RabbitsDeception extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Rabbit\'s Deception',
            playType: ['shootout'],
            combo: context => {
                const oppPosse = this.game.shootout.getPosseByPlayer(context.player.getOpponent());
                return oppPosse.getDudes(dude => dude.isStud()).length > 0;
            },
            onSuccess: (context) => {
                const wasBooted = context.kfDude.booted;
                this.game.shootout.sendHome(context.kfDude, context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.kfDude);
                });
                if(!wasBooted) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select a dude to send home booted',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.controller !== this.controller && card.isParticipating(),
                        cardType: 'dude',
                        gameAction: 'sendHome',
                        onSelect: (player, card) => {
                            this.game.shootout.sendHome(card, context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to send {2} home booted because {3} was not booted', 
                                    player, this, card, context.kfDude);
                            });
                            return true;
                        }
                    });
                }
            },
            source: this
        });
    }
}

RabbitsDeception.code = '10035';

module.exports = RabbitsDeception;
