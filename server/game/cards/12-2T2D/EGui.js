const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class EGui extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: E Gui',
            triggerBefore: true,
            when: {
                onCardDiscarded: event => event.card === this && event.isUpkeep &&
                    this.isAtDeed() && this.locationCard.owner !== this.controller
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2} and gain its production ({3} GR )', 
                    context.player, this, this.locationCard, this.locationCard.production),
            handler: context => {
                const thisLocationCard = this.locationCard;
                this.game.resolveGameAction(GameActions.bootCard({ card: thisLocationCard }), context);
                context.player.modifyGhostRock(thisLocationCard.production);
            }
        });
    }
}

EGui.code = '20006';

module.exports = EGui;
