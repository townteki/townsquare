const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class MiasmaticPurifier extends DeedCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onAtStartOfSundown: () => true
            },
            handler: context => {
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(pulledSuit === 'Clubs') {
                        const dudesHere = this.game.getDudesAtLocation(this.gamelocation);
                        if(dudesHere.length) {
                            this.untilEndOfRound(context.ability, ability => ({
                                match: dudesHere,
                                effect: [
                                    ability.effects.modifyInfluence(-1),
                                    ability.effects.doesNotUnbootAtSundown()
                                ]
                            }));
                            this.game.addMessage('{0} gives {1} at deed {2} -1 influence and they do not unboot this Sundown', 
                                context.player, dudesHere, this);
                        }
                        this.game.resolveGameAction(GameActions.discardCard({ card: this }), context);
                        this.game.addMessage('{0} discards {1} because the experiment fails', context.player, this);
                    }
                }, true, { context });
            }
        });
    }
}

MiasmaticPurifier.code = '11015';

module.exports = MiasmaticPurifier;
