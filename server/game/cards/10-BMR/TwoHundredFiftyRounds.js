const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TwoHundredFiftyRounds extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Shootout: Two Hundred Fifty Rounds',
            playType: ['shootout'],
            combo: () => this.locationCard && this.locationCard.controller === this.owner,
            onSuccess: context => {
                context.player.modifyCasualties(-1);
            },
            source: this
        });
    }
}

TwoHundredFiftyRounds.code = '18038';

module.exports = TwoHundredFiftyRounds;
