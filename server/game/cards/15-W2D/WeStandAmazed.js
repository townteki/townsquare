const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WeStandAmazed extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellReaction({
            title: 'React: We Stand Amazed',
            triggerBefore: true,
            when: {
                onCardDiscarded: event => event.card.isParticipating() &&
                    event.getType() === 'dude' &&
                    event.isCasualty
            },
            cost: ability.costs.bootSelf(),
            difficulty: context => context.event.card.getGrit(),
            onSuccess: (context) => {
                const saveEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    const sendHomeEvent = this.game.resolveGameAction(GameActions.sendHome({ card: context.event.card }), context);
                    if(!sendHomeEvent.isNull()) {
                        this.game.addMessage('{0} uses {1} to save {2} and send them home booted instead', context.player, this, context.event.card);
                    } else {
                        this.game.addMessage('{0} uses {1}, but {2} could not be saved because some effect prevented them from being sent home booted instead', 
                            context.player, this, context.event.card);
                        saveEventHandler(event);
                    }
                });                
            },
            source: this
        });
    }
}

WeStandAmazed.code = '23043';

module.exports = WeStandAmazed;
