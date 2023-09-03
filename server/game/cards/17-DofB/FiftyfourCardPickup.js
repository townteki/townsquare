const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FiftyfourCardPickup extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Boot opposing dude',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude to boot',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
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
        this.spellAction({
            title: 'Boot two opposing cards',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose 2 cards to boot',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
                gameAction: 'boot',
                numCards: 2,
                multiSelect: true
            },            
            difficulty: 11,
            onSuccess: (context) => {
                context.player.bootCards(context.target, context, cards => {
                    this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, cards);
                });
            },
            source: this
        });
    }
}

FiftyfourCardPickup.code = '25044';

module.exports = FiftyfourCardPickup;
