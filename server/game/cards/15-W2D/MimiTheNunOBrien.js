const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MimiTheNunOBrien extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Mimi "The Nun" O\'Brien',
            when: {
                onShootoutCasualtiesStepStarted: () => this.isParticipating()
            },
            handler: context => {
                context.player.discardFromHand(1, discarded => {
                    const casualtyReduction = context.player.isCheatin() ? 1 : 2;
                    this.game.resolveGameAction(GameActions.decreaseCasualties({
                        player: context.player,
                        amount: casualtyReduction
                    }), context).thenExecute(() =>
                        this.game.addMessage('{0} uses {1} and discards {2} to reduce their casualties by {3}', 
                            context.player, this, discarded, casualtyReduction));
                }, 
                {
                    activePromptTitle: 'Select a Miracle to discard',
                    condition: card => card.hasKeyword('miracle'),
                    source: this
                }, context);
            }
        });
    }
}

MimiTheNunOBrien.code = '23020';

module.exports = MimiTheNunOBrien;
