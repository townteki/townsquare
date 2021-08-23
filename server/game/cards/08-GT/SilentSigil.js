const DeedCard = require('../../deedcard.js');

class SilentSigil extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: player => player === this.controller,
            effect: ability.effects.modifySundownDiscard(-1)
        });
        this.reaction({
            title: 'Silent Sigil',
            when: {
                onCardsDrawn: event => event.reason === 'sundown' && event.player === this.controller
            },
            message: context => this.game.addMessage('{0} uses {1} to draw an additional card', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

SilentSigil.code = '14021';

module.exports = SilentSigil;
