const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class WaltersCreekDistillery extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Walters Creek Distillery',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Saloon or Casino',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', condition: card => 
                    (card.owner === this.controller || card.controller === this.controller) &&
                    card.hasOneOfKeywords(['Saloon', 'Casino']) &&
                    this.isSameStreet(card)
                },
                cardType: ['deed', 'outfit'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                if(context.target.hasKeyword('Casino')) {
                    context.player.modifyGhostRock(2);
                    this.game.addMessage('{0} uses {1} and boots {2} to gain 2 GR', context.player, this, context.target);
                }
                if(context.target.hasKeyword('Saloon')) {
                    context.player.redrawFromHand(1, (event, discardedCards) => {
                        this.game.addMessage('{0} uses {1} and boots {2} to discard {3} to draw a card', context.player, this, context.target, discardedCards[0]);
                    }, {
                        title: this.title
                    }, context);
                }                
            }
        });
    }
}

WaltersCreekDistillery.code = '14020';

module.exports = WaltersCreekDistillery;
