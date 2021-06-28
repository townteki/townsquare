const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

// For Dr. Dawn Edwards, we cannot use traitReaction because it is in effect only if card is in play. Since the triggering
// event is on discarded, Dr. Dawn Edwards at that time is not in play therefore her trigger will not work.
// Instead we use one time conditional game wide event trigger for her that is put in place when she enters play and
// removed once she leaves. `leavesPlay` function executes after the discard event so we are safe here.
class DrDawnEdwards extends DudeCard {
    entersPlay() {
        super.entersPlay();
        this.discardHandler = this.game.onceConditional('onCardDiscarded', { condition: event => event.card === this && event.isCasualty }, 
            event => this.eventHandler(event)
        );
    }

    leavesPlay() {
        super.leavesPlay();
        this.game.removeListener('onCardDiscarded', this.discardHandler);
    }

    eventHandler(event) {
        // Eve Henry's code is 01054
        if(!this.controller.cardsInPlay.find(card => card.code === '01054')) {
            this.game.promptForYesNo(this.controller, {
                title: 'Do you want to search your deck for Eve Henry?',
                onYes: player => {
                    this.game.resolveGameAction(
                        GameActions.search({
                            title: 'Select Eve Henry if you want to put her into play',
                            match: { type: 'dude', condition: card => card.code === '01054' },
                            location: ['draw deck'],
                            numToSelect: 1,
                            message: {
                                format: '{player} searches their draw deck, and put {searchTarget} into play thanks to {source}'
                            },
                            cancelMessage: {
                                format: '{player} searches their draw deck thanks to {source}, but does not find Eve Henry'
                            },
                            handler: card => {
                                this.game.resolveGameAction(GameActions.putIntoPlay({ 
                                    player: player,
                                    card: card,
                                    params: {target: event.originalGameLocation}
                                }));
                            }
                        }), {
                            game: this.game,
                            player: player,
                            source: this
                        }
                    );  
                },
                source: this
            });
        }
    }
}

DrDawnEdwards.code = '01052';

module.exports = DrDawnEdwards;
