const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BakerAndrews extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Resolution: Baker Andrews',
            playType: ['resolution'],
            ifCondition: () => this.controller.isCheatin(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails because their hand is legal', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: this }), context).thenExecute(() => {
                    if(context.player.modifyRank(1, context)) {
                        this.game.addMessage('{0} uses {1} and adds 1 bounty to him to increase their hand rank by 1; Current rank is {2}', 
                            context.player, this, context.player.getTotalRank());
                    }
                });
            }
        });
    }
}

BakerAndrews.code = '24085';

module.exports = BakerAndrews;
