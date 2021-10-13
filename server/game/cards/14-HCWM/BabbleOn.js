const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BabbleOn extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellReaction({
            title: 'React: Unboot your dude',
            when: {
                onCardBooted: event => event.context && event.context.source &&
                    event.context.source !== this &&
                    event.context.source.hasKeyword('miracle') &&
                    event.card.getType() === 'dude' &&
                    event.card.controller === event.context.player
            },
            difficulty: 6,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.event.card }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.event.card);
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Boot opposing card',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            target: {
                activePromptTitle: 'Select a card to boot',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                gameAction: 'boot'
            },
            difficulty: 7,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target); 
                });
            },
            source: this
        });
    }
}

BabbleOn.code = '22048';

module.exports = BabbleOn;
