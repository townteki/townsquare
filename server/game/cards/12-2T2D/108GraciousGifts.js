const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class GraciousGifts extends OutfitCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.owner.ghostrock < this.owner.getOpponent().ghostrock,
            match: this.owner,
            effect: ability.effects.modifyNightfallDiscard(1)
        });

        this.action({
            title: 'Noon: Unboot Your Dude',
            playType: 'noon',
            cost: [ 
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(2)
            ],
            target: {
                activePromptTitle: 'Select Your Dude to unboot',
                waitingPromptTitle: 'Waiting for Opponent to Select Their Dude',
                cardCondition: card => card.location === 'play area' && card.controller.equals(this.controller),
                cardType: 'dude',
                gameAction: 'unboot'
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
            }
        });
    }
}

GraciousGifts.code = '20001';

module.exports = GraciousGifts;
