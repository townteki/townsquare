const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class WalkThePath extends SpellCard {
    setupCardAbilities(ability) {
        this.spell({
            title: 'Noon: Walk the Path',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            target: {
                activePromptTitle: 'Select your dude to move',
                cardCondition: { location: 'play area' },
                cardType: ['dude']
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.target, 
                    targetUuid: this.parent.gamelocation, 
                    options: { needToBoot: false, allowBooted: true }
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, context.target, this.parent.locationCard);
                });
            },
            source: this
        });

        this.spell({
            title: 'Shootout: Walk the Path',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            target: {
                activePromptTitle: 'Select your dude to join',
                cardCondition: { location: 'play area', participating: false },
                cardType: ['dude']
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context).thenExecute(event => {
                    if(event.card.booted) {
                        this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(event => {
                            if(event.card.booted) {
                                this.game.addMessage('{0} uses {1} to join {2} to posse.', context.player, this, context.target);
                            } else {
                                this.game.addMessage('{0} uses {1} to join {2} to posse and unboots them.', context.player, this, context.target);
                            }
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} to join {2} to posse.', context.player, this, context.target);
                    }
                });
            },
            source: this
        });
    }
}

WalkThePath.code = '05033';

module.exports = WalkThePath;
