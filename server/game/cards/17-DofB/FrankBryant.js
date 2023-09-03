const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FrankBryant extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Add Bounty',
            when: {
                onCardEntersPlay: event => event.card === this
            },
            message: context => this.game.addMessage('{0} uses {1} to give him 1 bounty', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: this }), context);
            }
        });

        this.persistentEffect({
            targetController: 'opponent',
            // Add always-on condition if effect is state dependent so it will be 
            // rechecked after every event
            condition: () => true,
            match: card => card.location === 'play area' && card.getType() === 'dude' &&
                card.bounty < this.bounty,
            effect: [
                ability.effects.cannotRefuseCallout(this, dude => dude.equals(this))
            ]
        });
    }
}

FrankBryant.code = '25023';

module.exports = FrankBryant;
