const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

// For Eve Henry, we cannot use traitReaction because it is in effect only if card is in play. Since the triggering
// event is on discarded, Eve at that time is not in play therefore her trigger will not work.
// Instead we use one time conditional game wide event trigger for her that is put in place when she enters play and
// removed once she leaves. `leavesPlay` function executes after the discard event so we are safe here.
class EveHenry extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardDiscarded: event => event.card === this && event.isCasualty
            },
            location: 'discard pile',
            handler: context => {
                // Dr. Dawn Edwards code is 01052
                if(!this.controller.cardsInPlay.find(card => card.code === '01052')) {
                    this.game.promptForYesNo(this.controller, {
                        title: 'Do you want to search your deck for Dr. Dawn Edwards?',
                        onYes: player => {
                            this.game.resolveGameAction(
                                GameActions.search({
                                    title: 'Select Dr. Dawn Edwards if you want to put her into play',
                                    match: { type: 'dude', condition: card => card.code === '01052' },
                                    location: ['draw deck'],
                                    numToSelect: 1,
                                    message: {
                                        format: '{player} searches their draw deck to put {searchTarget} into play thanks to {source}'
                                    },
                                    cancelMessage: {
                                        format: '{player} searches their draw deck thanks to {source}, but does not find Dr. Dawn Edwards'
                                    },
                                    handler: card => {
                                        this.game.resolveGameAction(GameActions.putIntoPlay({ 
                                            player: player,
                                            card: card,
                                            params: { targetLocationUuid: context.event.originalGameLocation, context }
                                        }));
                                    }
                                }),
                                context
                            );  
                        },
                        source: this
                    });
                }            
            }
        });
    }
}

EveHenry.code = '01054';

module.exports = EveHenry;
