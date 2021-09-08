const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GuidingLight extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Pay 1 GR to send your dude home',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1, true)
            ],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => this.parent &&
                        card.isNearby(this.parent.gamelocation) 
                },
                cardType: ['dude'],
                gameAction: 'sendHome'
            },
            difficulty: 5,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target, options: { needToBoot: false }}), context).thenExecute(() => {
                    if(context.player.ghostrock < context.player.getOpponent().ghostrock && context.target.booted) {
                        this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to send {2} home without booting and unboots them', context.player, this, context.target);
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} to send {2} home without booting', context.player, this, context.target);
                    }
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Noon: Pay 2 GR to send opponent\'s dude home',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(2, true)
            ],
            target: {
                activePromptTitle: 'Choose opponent\'s dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => this.parent &&
                        card.isNearby(this.parent.gamelocation) 
                },
                cardType: ['dude'],
                gameAction: 'sendHome'
            },
            difficulty: 5,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target, options: { needToBoot: false }}), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to send {2} home without booting', context.player, this, context.target);
                });
            },
            source: this
        });        
    }
}

GuidingLight.code = '21048';

module.exports = GuidingLight;
