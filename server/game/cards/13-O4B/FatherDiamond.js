const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FatherDiamond extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Father Diamond',
            playType: ['noon'],
            ifCondition: () => {
                const thisLocationCard = this.locationCard;
                return thisLocationCard && thisLocationCard.getType() === 'deed' && 
                    thisLocationCard.owner !== this.controller;
            },
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but it fails because he is not at a deed {0} does not own', 
                    context.player, this),
            handler: context => {
                if(this.game.getNumberOfPlayers() === 1) {
                    return;
                }
                if(context.player.getSpendableGhostRock() >= 1) {
                    this.game.transferGhostRock({ 
                        from: context.player, 
                        to: context.player.getOpponent(), 
                        amount: 1 
                    });
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose your dude to send home',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller === context.player &&
                            card.gamelocation === this.gamelocation,
                        cardType: 'dude',
                        gameAction: ['sendHome'],
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.sendHome({
                                card,
                                options: { needToBoot: false }
                            }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} and pays 1 GR to {2} to send {3} home', 
                                    player, this, player.getOpponent(), card);
                            });
                            return true;
                        },
                        source: this
                    });
                    this.game.promptForLocation(context.player, {
                        activePromptTitle: 'Select where Father should move to',
                        waitingPromptTitle: 'Waiting for opponent to select location for Father Diamond',
                        cardCondition: { 
                            location: 'play area',
                            condition: card => card.uuid !== this.gamelocation
                        },
                        onSelect: (player, location) => {
                            this.game.resolveGameAction(GameActions.moveDude({ 
                                card: this, 
                                targetUuid: location.uuid
                            }), context);   
                            this.game.addMessage('{0} uses {1} to move him to {2}', player, this, location);                                 
                            return true;
                        },
                        source: this
                    }); 
                } else {
                    this.game.addMessage('{0} uses {1} but does not have 1 GR to pay', this.controller, this);
                }
            }
        });
    }
}

FatherDiamond.code = '21011';

module.exports = FatherDiamond;
