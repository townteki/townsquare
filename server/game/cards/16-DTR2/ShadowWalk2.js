const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class ShadowWalk2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Shadow Walk',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            actionContext: { card: this.parent, gameAction: 'moveDude'},
            onSuccess: (context) => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where to move ' + this.parent.title,
                    cardCondition: { condition: card => card.gamelocation !== this.parent.gamelocation },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this.parent, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, this.parent, location);                                 
                        return true;
                    },
                    source: this
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Shadow Walk',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            actionContext: { card: this.parent, gameAction: 'joinPosse'},
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent })).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, this.parent); 
                });
                this.game.promptForYesNo(context.player, {
                    title: `Do you want to discard ${this.title} to make another play?`,
                    onYes: player => {
                        this.game.resolveGameAction(GameActions.discardCard({ card: this })).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} and discards it to make another play', player, this); 
                            this.game.makePlayOutOfOrder(player, this, 'Make shootout play');
                        });
                    },
                    source: this
                });
            },
            source: this
        });
    }
}

ShadowWalk2.code = '25247';

module.exports = ShadowWalk2;
