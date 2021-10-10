const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TwoHundredFiftyRounds extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Shootout: Two Hundred Fifty Rounds',
            playType: ['shootout'],
            combo: context => context.kfDude.locationCard && context.kfDude.locationCard.controller === this.owner,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                    player: context.player,
                    amount: 1
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to reduce their casualties by 1', context.player, this);
                });  
            },
            source: this
        });
    }
}

TwoHundredFiftyRounds.code = '18038';

module.exports = TwoHundredFiftyRounds;
