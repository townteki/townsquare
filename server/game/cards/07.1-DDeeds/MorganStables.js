const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MorganStables extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            effect: [
                ability.effects.reduceFirstCardCostEachRound(1, card => 
                    card.hasKeyword('horse'))
            ]
        });

        this.reaction({
            title: 'React: Morgan Stables',
            when: {
                onDudeMoved: event => this.controller.equals(event.card.controller) &&
                    event.options.context && event.options.context.ability &&
                    this.controller.equals(event.options.context.player) &&
                    event.options.context.ability.isCardAbility() &&
                    ['shootout', 'shootout:join', 'noon'].includes(event.options.context.ability.playTypePlayed())
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.drawCardsToHand(1, context).thenExecute(() => {
                    context.player.discardFromHand(1, discarded => {
                        this.game.addMessage('{0} uses {1} to draw a card and discard {2}', 
                            context.player, this, discarded);
                        let title = 'Make another play';
                        if(context.event.options.context.ability.playTypePlayed() === 'noon') {
                            title += ' (cannot be Actin\')';
                        }
                        this.game.makePlayOutOfOrder(context.player, this, {
                            title,
                            noCancelButton: true,
                            buttons: [
                                { text: 'Pass', method: 'onPassOutOfOrder' }
                            ]
                        });
                    }, {}, context);
                });
            }
        });
    }
}

MorganStables.code = '11003';

module.exports = MorganStables;
