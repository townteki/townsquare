const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JadeKingStance extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Noon: Jade King Stance',
            playType: ['noon'],
            actionContext: { gameAction: 'unboot' },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.kfDude }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.kfDude);
                });
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.kfDude,
                    effect: [
                        ability.effects.modifyBullets(2),
                        ability.effects.modifySkillRating('kung fu', 2),
                        ability.effects.cannotBeMoved()
                    ]
                }));
                this.game.addMessage('{0} uses {1} to give {2} +2 bullets, +2 kung fu and they cannot move', 
                    context.player, this, context.kfDude);
            },
            source: this
        });
    }
}

JadeKingStance.code = '20051';

module.exports = JadeKingStance;
