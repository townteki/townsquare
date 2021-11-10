const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RosaleenByrne extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Rosaleen Byrne',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.redrawFromHand(2, (event, discarded) => {
                    this.game.addMessage('{0} uses {1} to discard {2} and draw 2 cards', context.player, this, discarded);
                }, { 
                    activePromptTitle: 'Select 2 cards to discard',
                    discardExactly: true,
                    source: this
                }, context);
            }
        });
    }
}

RosaleenByrne.code = '23022';

module.exports = RosaleenByrne;

