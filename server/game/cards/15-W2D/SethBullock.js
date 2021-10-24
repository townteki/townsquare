const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SethBullock extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating() && this.controller.isCheatin(),
            match: this.controller,
            effect: ability.effects.dynamicHandRankMod(() => -this.bullets)
        });

        this.reaction({
            title: 'React: Seth Bullock',
            when: {
                onCardPlayed: event => event.player === this.controller && 
                    event.ability.playTypePlayed() === 'cheatin resolution' &&
                    event.card.getType() === 'action'
            },
            message: context => this.game.addMessage('{0} uses {1} to unboot himself', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
            }
        });
    }
}

SethBullock.code = '23018';

module.exports = SethBullock;
