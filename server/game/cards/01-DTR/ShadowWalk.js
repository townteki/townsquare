const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class ShadowWalk extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Shadow Walk',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: (context) => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where shadow should lead ' + this.parent.title,
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this.parent, 
                            targetUuid: location.uuid, 
                            options: { needToBoot: false, allowBooted: true }
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}.', player, this, this.parent, location);                                 
                        return true;
                    }
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Shadow Walk',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent })).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to join {2} to posse.', context.player, this, this.parent); 
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Make shootout play',
                            buttons: [
                                { text: 'Pass', method: 'pass' }
                            ],
                            promptTitle: this.title
                        },
                        source: this
                    });
                });
            },
            source: this
        });
    }

    pass() {
        return true;
    }
}

ShadowWalk.code = '01102';

module.exports = ShadowWalk;
