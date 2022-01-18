const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class MarshalCavesCallarman extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => -this.bounty),
                ability.effects.dynamicInfluence(() => -this.bounty)
            ]
        });

        this.action({
            title: 'Reduce Bounty',
            playType: 'noon',
            ifCondition: () => this.locationCard.isPublic(),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1}\'s ability, but it has no effect since he is not at a Public location', 
                    context.player, this),
            cost: ability.costs.discardFromHand(),
            message: context => 
                this.game.addMessage('{0} uses {1}\'s ability to discard {2} and reduce his bounty by 1', 
                    context.player, this, context.costs.discardFromHand),
            handler: context => {
                this.game.resolveGameAction(GameActions.removeBounty({ card: this, amount: 1 }), context);
            }
        });
    }
}

MarshalCavesCallarman.code = '22023';

module.exports = MarshalCavesCallarman;
