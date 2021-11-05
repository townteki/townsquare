const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DorisPowell extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onRoundEnded: () => this.location === 'play area',
                onDudeEnteredLocation: event => event.card === this && event.gameLocation.isHome(this.controller)
            },
            handler: () => this.removeAllControl()
        });

        this.traitReaction({
            when: {
                onDudeEnteredLocation: event => event.card === this && !event.gameLocation.isOutOfTown() &&
                    !event.options.needToBoot && event.options.moveType && event.gameLocation.isDeed()
            },
            handler: context => {
                if(this.control < 3) {
                    this.untilEndOfRound(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.modifyControl(1)
                    }));
                    this.game.addMessage('{0} gives CP to {1} as she moved to in-town deed without booting', 
                        context.player, this);
                }
            }
        });
    }
}

DorisPowell.code = '11012';

module.exports = DorisPowell;
