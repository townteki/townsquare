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
                context.player.modifyCasualties(-1);
                this.game.addMessage('{0} uses {1} to reduce their casualties by 1', context.player, this);
            },
            source: this
        });
    }
}

TwoHundredFiftyRounds.code = '18038';

module.exports = TwoHundredFiftyRounds;
