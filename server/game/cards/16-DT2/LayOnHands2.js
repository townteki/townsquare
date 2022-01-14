const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class LayOnHands2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellReaction({
            triggerBefore: true,
            when: {
                onCardAced: event => event.canPrevent && event.card.getType() === 'dude' && 
                    event.originalLocation === 'play area' &&
                    (event.card.gamelocation === this.gamelocation ||
                    event.card.isAdjacent(this.gamelocation)),
                onCardDiscarded: event => event.card.getType() === 'dude' && 
                    event.originalLocation === 'play area' &&
                    (event.card.gamelocation === this.gamelocation ||
                    event.card.isAdjacent(this.gamelocation)) &&
                    event.isCasualty
            },
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this.parent, allowSave: false }), context).thenExecute(() => {
                    const saveEventHandler = context.event.handler;
                    context.replaceHandler(event => {
                        const sendHomeEvent = this.game.resolveGameAction(GameActions.sendHome({ card: context.event.card }), context);
                        if(!sendHomeEvent.isNull()) {
                            this.untilEndOfRound(context.ability, ability => ({
                                match: context.event.card,
                                effect: ability.effects.doesNotUnbootAtNightfall()
                            }));
                            this.game.addMessage('{0} uses {1} to save {2} and send them home booted instead', context.player, this, context.event.card);
                        } else {
                            this.game.addMessage('{0} uses {1}, but {2} could not be saved because some effect prevented to send them home booted instead', 
                                context.player, this, context.event.card);
                            saveEventHandler(event);
                        }
                    });
                });
            }
        });
    }
}

LayOnHands2.code = '24193';

module.exports = LayOnHands2;
