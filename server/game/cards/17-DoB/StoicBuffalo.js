const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class StoicBuffalo extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Draw card after pass',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 9,
            onSuccess: (context) => {
                const eventHandler = event => {
                    if(event.playWindow.name === 'shootout plays' && context.player.equals(event.player)) {
                        context.player.drawCardsToHand(1, context);
                    }
                };
                this.game.on('onPassAction', eventHandler);
                this.game.once('onShootoutRoundFinished', () => {
                    this.game.removeListener('onPassAction', eventHandler);
                });                 
            },
            source: this
        });
    }
}

StoicBuffalo.code = '25048';

module.exports = StoicBuffalo;
