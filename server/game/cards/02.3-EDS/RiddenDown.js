const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RiddenDown extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Ridden Down',
            playType: ['noon'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.controller === this.owner &&
                card.hasKeyword('horse')),
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to send home',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => !card.hasHorse() && 
                        card.gamelocation === context.costs.boot.gamelocation,
                    cardType: 'dude',
                    gameAction: ['sendHome', 'boot'],
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.sendHome({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} and boots {2} to send {3} home booted', 
                                player, this, context.costs.boot, card);
                        });
                        return true;
                    }
                });
            }
        });
    }
}

RiddenDown.code = '04019';

module.exports = RiddenDown;
