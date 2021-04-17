const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class LucindaLucyClover extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.getOpponent().isCheatin()
            },
            message: context => this.game.addMessage('{0}\'s dudes in posse have their bounty increased thanks to the {1}', 
                context.player.getOpponent(), this),
            handler: context => {
                let posseOpposingLucy = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
                if(posseOpposingLucy) {
                    posseOpposingLucy.actOnPosse(dude => this.game.resolveGameAction(GameActions.addBounty({ card: dude }), context));
                }
            }
        });
    }
}

LucindaLucyClover.code = '01015';

module.exports = LucindaLucyClover;
