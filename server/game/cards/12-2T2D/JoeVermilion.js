const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JoeVermilion extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Joe Vermilion',
            playType: ['noon'],
            ifCondition: () => {
                const thisLocationCard = this.locationCard;
                return thisLocationCard && thisLocationCard.getType() === 'deed' &&
                    thisLocationCard.owner !== this.controller;
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails because he is not at deed {0} does not own', 
                    context.player, this),
            handler: context => {
                if(context.player.getSpendableGhostRock() >= 1) {
                    this.game.transferGhostRock({
                        from: context.player,
                        to: context.player.getOpponent(),
                        amount: 1
                    });
                    const gainedGR = this.locationCard.production;
                    context.player.modifyGhostRock(gainedGR);
                    this.game.addMessage('{0} uses {1} and pays 1 GR to gain {2} GR', 
                        context.player, this, gainedGR);
                } else {
                    this.game.addMessage('{0} uses {1} but does not have 1 GR to pay', 
                        context.player, this);
                }
            }
        });
    }
}

JoeVermilion.code = '20004';

module.exports = JoeVermilion;
