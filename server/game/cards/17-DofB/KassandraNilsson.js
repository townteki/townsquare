const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class KassandraNilsson extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Move to Location',
            playType: ['noon', 'shootout:join'],
            actionContext: { card: this, gameAction: () => {
                if(this.game.shootout) {
                    const actionArray = ['joinPosse'];
                    if(this.isInShootoutLocation()) {
                        actionArray.unshift('moveDude');
                    }
                    return actionArray;
                }
                return 'moveDude';
            } },             
            handler: context => {
                if(this.game.shootout && this.game.shootout.getPosseByPlayer(this.controller).findInPosse(dude => dude.hasHorse())) {
                    this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context)
                        .thenExecute(() => this.game.addMessage('{0} uses {1} to join posse', context.player, this, context.target));                    
                } else {
                    this.game.promptForLocation(context.player, {
                        activePromptTitle: 'Select where Kassandra should move to',
                        waitingPromptTitle: 'Waiting for opponent to select location',
                        cardCondition: { 
                            location: 'play area', 
                            controller: 'any', 
                            condition: locationCard => {
                                return this.game.findCardsInLocation(locationCard.uuid, 
                                    card => card.controller.equals(this.controller) && card.hasKeyword('horse')).length;
                            }
                        },
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.moveDude({ card: this, targetUuid: card.uuid }), context)
                                .thenExecute(() => this.game.addMessage('{0} uses {1} to move her to {2}', player, this, card));
                            return true;
                        },
                        source: this
                    });
                }
            }
        });
    }
}

KassandraNilsson.code = '25005';

module.exports = KassandraNilsson;
