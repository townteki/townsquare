const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class DrDawnEdwards extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardDiscarded: event => event.card === this && event.isCasualty
            },
            location: 'discard pile',
            handler: context => {            
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
                                        format: '{player} searches their draw deck to put {searchTarget} into play thanks to {source}'
                                    },
                                    cancelMessage: {
                                        format: '{player} searches their draw deck thanks to {source}, but does not find Eve Henry'
                                    },
                                    handler: card => {
                                        this.game.resolveGameAction(GameActions.putIntoPlay({ 
                                            player: player,
                                            card: card,
                                            params: {targetLocationUuid: context.event.originalGameLocation, context}
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

DrDawnEdwards.code = '01052';

module.exports = DrDawnEdwards;
