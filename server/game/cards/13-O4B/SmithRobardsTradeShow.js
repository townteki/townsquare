const OutfitCard = require('../../outfitcard.js');

class SmithRobardsTradeShow extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Smith & Robards Trade Show',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.controller === this.owner &&
                    card.location === 'play area' &&
                    card.getType() === 'goods' &&
                    card.isGadget()
                )
            ],
            handler: context => {
                context.player.redrawFromHand(1, () => { 
                    this.game.addMessage('{0} uses {1} and boots {2} to discard a card and draw a card', 
                        context.player, this, context.costs.boot);
                }, { 
                    title: this.title
                });
                const gadgetLocationCard = context.costs.boot.locationCard;
                if(gadgetLocationCard && gadgetLocationCard.controller === this.owner && 
                    gadgetLocationCard.owner !== this.owner) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.costs.boot,
                        effect: ability.effects.modifyControl(1)
                    }));
                    this.game.addMessage('{0} uses {1} to give {2} 1 CP until the end of the turn', 
                        context.player, this, context.costs.boot);
                }       
            }
        });
    }
}

SmithRobardsTradeShow.code = '21005';

module.exports = SmithRobardsTradeShow;
