const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class ProtectionRacket extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Protection Racket',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.location === 'play area' &&
                    card.getType() === 'dude' &&
                    card.locationCard.getType() === 'deed'
                )
            ],
            handler: context => {
                let numOfOccupiedDeeds = 0;
                let numOfDeedsOwnedByOpp = 0;
                this.game.filterCardsInPlay(card => card.getType() === 'deed' && card.owner !== context.player)
                    .forEach(deed => {
                        if(deed.controller === context.player) {
                            numOfOccupiedDeeds += 1;
                        }
                        numOfDeedsOwnedByOpp += 1;
                    });
                let amountGRGained = numOfOccupiedDeeds;
                if(numOfDeedsOwnedByOpp < 3) {
                    amountGRGained += 2;
                }
                if(amountGRGained) {
                    context.player.modifyGhostRock(amountGRGained);
                    this.game.addMessage('{0} uses {1} and boots {2} to gain {3} GR', 
                        context.player, this, context.costs.boot, amountGRGained);
                } else {
                    this.game.addMessage('{0} uses {1} and boots {2} but does not gain any GR', 
                        context.player, this, context.costs.boot);
                }
                if(numOfOccupiedDeeds >= 3) {
                    context.costs.boot.modifyControl(1);
                    this.game.resolveGameAction(GameActions.addBounty({ card: context.costs.boot }), context);
                    this.game.addMessage('{0} uses {1} to add 1 permanent CP and 1 bounty to {2}', 
                        context.player, this, context.costs.boot);
                }
            }
        });
    }
}

ProtectionRacket.code = '18006';

module.exports = ProtectionRacket;
