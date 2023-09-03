const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class KassandraNilsson extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Move to Location',
            playType: ['noon', 'shootout:join'],
            handler: context => {
                if(this.game.shootout && context.target.equals(this.game.shootout.shootoutLocation.locationCard)) {
                    this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context)
                        .thenExecute(() => this.game.addMessage('{0} uses {1} to join posse', context.player, this, context.target));                    
                } else {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose location to move to',
                        cardCondition: { 
                            location: 'play area', 
                            controller: 'any', 
                            condition: card => {
                                const gameLocation = card.getGameLocation();
                                if(gameLocation) {
                                    return gameLocation.getDudes(dude => 
                                        dude.controller.equals(this.controller) && dude.hasHorse());
                                }
                                return false;
                            }
                        },
                        cardType: ['location'],
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
