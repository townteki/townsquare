const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class UlyssesMarks extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.location === 'play area' && this.locationCard.hasKeyword('Saloon'),
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyControl(1)
        });
        this.action({
            title: 'Ulysses Marks',
            playType: 'noon',     
            handler: context => {
                if(this.locationCard.hasKeyword('Saloon')) {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a dude to kick out of the saloon',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card !== this && this.isInSameLocation(card),
                        cardType: 'dude',
                        autoSelect: true,
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.moveDude({ 
                                card: card, 
                                targetUuid: this.game.townsquare.uuid, 
                                options: { needToBoot: true, allowBooted: true } 
                            }), context);
                            this.game.addMessage('{0} uses {1} to kick {2} out of the {3}.', player, this, card, this.locationCard);
                            return true;
                        },
                        source: this
                    });
                }
            }
        });
    }
}

UlyssesMarks.code = '02007';

module.exports = UlyssesMarks;
