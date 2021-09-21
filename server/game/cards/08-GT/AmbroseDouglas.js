const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AmbroseDouglas extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Ambrose Douglas',
            playType: ['noon'],
            cost: ability.costs.discardFromHand(),
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to give himself +1 influence', 
                    context.player, this, context.costs.discardFromHand),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyInfluence(1)
                }));
                if(context.costs.discardFromHand.getType() === 'spell' || context.costs.discardFromHand.hasKeyword('mystical')) {
                    this.game.promptForYesNo(context.player, {
                        title: 'Do you want to unboot your Outfit?',
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.unbootCard({ card: player.outfit }), context);
                            player.outfit.resetAbilities();
                            this.game.addMessage('{0} uses {1} to unboot {2} and reset its abilities', player, this, player.outfit);
                        },
                        source: this
                    });
                }
            }
        });
    }
}

AmbroseDouglas.code = '14005';

module.exports = AmbroseDouglas;
