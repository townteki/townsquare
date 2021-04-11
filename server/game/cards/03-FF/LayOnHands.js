const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class LayOnHands extends SpellCard {
    setupCardAbilities(ability) {
        this.spellReaction({
            usesInstead: true,
            when: {
                onCardAced: event => event.card.getType() === 'dude' && 
                    (event.card.gamelocation === this.gamelocation ||
                    event.card.getGameLocation().isAdjacent(this.gamelocation)),
                onCardDiscarded: event => event.card.getType() === 'dude' && 
                    (event.card.gamelocation === this.gamelocation ||
                    event.card.getGameLocation().isAdjacent(this.gamelocation)) &&
                    event.isCasualty
            },
            cost: ability.costs.bootSelf(),
            difficulty: 8,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this.parent, allowSave: false }), context).thenExecute(() => {
                    context.replaceHandler(() => {
                        this.game.resolveGameAction(GameActions.sendHome({ card: context.event.card }), context);
                        this.untilEndOfRound(ability => ({
                            match: context.event.card,
                            effect: ability.effects.doesNotUnbootAtSundown()
                        }));
                        this.game.addMessage('{0} uses {1} to save {2} and send them home instead', context.player, this, context.event.card);
                    });
                });
            }
        });
    }
}

LayOnHands.code = '05029';

module.exports = LayOnHands;
