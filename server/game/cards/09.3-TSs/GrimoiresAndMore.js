const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class GrimoiresAndMore extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Grimoires & More',
            when: {
                onCardEntersPlay: event => event.card.controller === this.controller && event.card.getType() === 'dude' && event.card.hasKeyword('huckster')
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                const dude = context.event.card;
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if('clubs' === pulledSuit.toLowerCase()) {
                        this.game.resolveGameAction(GameActions.sendHome({ card: dude, needToBoot: true}), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to pull {2} and has to send {3} home because it is a club', context.player, this, pulledCard, dude);
                        });
                    } else {
                        this.game.resolveGameAction(
                            GameActions.search({
                                title: 'Select a Hex to attach',
                                match: { keyword: 'hex', type: 'spell' },
                                location: ['discard pile'],
                                numToSelect: 1,
                                message: {
                                    format: '{player} plays {source} to search their discard pile, and puts {searchTarget} into play'
                                },
                                cancelMessage: {
                                    format: '{player} plays {source} to search their discard pile, but does not find a Hex'
                                },
                                handler: card => {
                                    this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                        playType: 'ability',
                                        sourceType: 'ability',
                                        targetParent: dude
                                    }), context.player, card);
                                }
                            }),
                            context
                        );                
                    }                    
                }, true, { context });
            }
        });
    }
}

GrimoiresAndMore.code = '17011';

module.exports = GrimoiresAndMore;
