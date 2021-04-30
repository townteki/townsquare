const SpellCard = require('../../spellcard.js');

class Fetch extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Fetch',
            playType: 'cheatin resolution',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                if(this.game.shootout) {
                    context.player.modifyCasualties(-3);
                    this.game.addMessage('{0} uses {1} to suffer 3 less casualties', context.player, this);
                }
                this.game.before('onDrawHandDiscarded', event => {
                    this.game.promptForSelect(event.player, {
                        activePromptTitle: 'Select a card',
                        waitingPromptTitle: 'Waiting for opponent to select card',
                        cardCondition: card => card.location === 'draw hand' && card.controller === this.controller,
                        cardType: ['dude', 'deed', 'goods', 'spell', 'action', 'joker'],
                        onSelect: (player, card) => {
                            player.moveCard(card, 'hand');
                            this.game.addMessage('{0} places {1} back to their hand thanks to {2}', player, card, this);                          
                            return true;
                        },
                        source: this
                    });
                }, true, event => event.player === context.player);
            },
            source: this
        });
    }
}

Fetch.code = '03018';

module.exports = Fetch;
