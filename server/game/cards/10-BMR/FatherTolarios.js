const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FatherTolarios extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Father Tolarios',
            playType: ['noon'],
            cost: ability.costs.discardFromHand(),
            target: {
                activePromptTitle: 'Choose a wanted dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    wanted: true,
                    condition: (card) => card.isNearby(this.gamelocation)
                },
                cardType: ['dude'],
                gameAction: 'removeBounty',
                ifAble: true
            },
            message: context => {
                if(context.target) {
                    this.game.addMessage('{0} uses {1}, discards {2} and lowers bounty on {3} to search their deck and discard pile', 
                        context.player, this, context.costs.discardFromHand, context.target);
                } else {
                    this.game.addMessage('{0} uses {1} and discards {2}', 
                        context.player, this, context.costs.discardFromHand, context.target);
                }
            },
            handler: context => {
                if(context.target) {
                    this.game.resolveGameAction(GameActions.removeBounty({ card: context.target }), context).thenExecute(() => {
                        this.game.resolveGameAction(
                            GameActions.search({
                                title: 'Select a Miracle or Mystical goods',
                                match: { 
                                    keyword: ['Miracle', 'Mystical'], 
                                    not: { keyword: 'Unique'},
                                    type: ['goods', 'spell'] 
                                },
                                location: ['draw deck', 'discard pile'],
                                numToSelect: 1,
                                cancelMessage: {
                                    format: '{player} does not put anything into hand after searching their deck and discard pile'
                                },
                                handler: card => {
                                    if(context.player.moveCardWithContext(card, 'hand', context)) {
                                        this.game.addMessage('{0} puts {1} to their hand using the {2}', context.player, card, this);
                                    }
                                }
                            }),
                            context
                        );    
                    });
                }
            }
        });
    }
}

FatherTolarios.code = '18015';

module.exports = FatherTolarios;
