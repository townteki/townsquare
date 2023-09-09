const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class YuanMin extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards(this, attachment => attachment.hasKeyword('weapon'))
        });        
        this.action({
            title: 'Search for Tao technique',
            playType: ['shootout'],
            cost: ability.costs.discardFromHand(),
            handler: context => {
                this.game.resolveGameAction(GameActions.search({
                    title: 'Search for Tao technique',
                    match: { keyword: ['technique'], type: ['action'], condition: card => card.isTaoTechnique() },
                    location: ['discard pile'],
                    numToSelect: 1,
                    message: {
                        format: '{player} uses {source} and searches their discard pile for Tao Technique'
                    },
                    cancelMessage: {
                        format: '{player} uses {source} and searches their discard pile, but does not find a Tao Technique'
                    },
                    handler: (card, searchContext) => {
                        if(context.player.moveCardWithContext(card, 'hand', searchContext, true)) {
                            this.game.addMessage('{0} uses {1} and discards {2} to put {3} in their hand', 
                                context.player, this, context.costs.discardFromHand, card);
                        }
                    }
                }), context);
            }
        });
    }
}

YuanMin.code = '25002';

module.exports = YuanMin;
