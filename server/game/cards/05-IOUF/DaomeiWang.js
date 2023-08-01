const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class DaomeiWang extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Daomei Wang',
            when: {
                onCardEntersPlay: event => event.card === this
            },
            target: {
                activePromptTitle: 'Choose one of your Bandits to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.belongsToGang('anarchists') && card !== this
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select destination',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}.', player, this, context.target, location);                                 
                        return true;
                    }
                });
            }
        });
    }
}

DaomeiWang.code = '09004';

module.exports = DaomeiWang;
