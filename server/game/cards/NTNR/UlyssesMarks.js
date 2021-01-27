const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class UlyssesMarks extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.getLocationCard().hasKeyword('Saloon'),
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyControl(1)
        });
        this.action({
            title: 'Ulysses Marks',
            playType: 'noon',     
            handler: context => {
                if (this.getLocationCard().hasKeyword('Saloon')) {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a dude to kick out of the saloon',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card != this && card.gamelocation === this.gamelocation,
                        cardType: 'dude',
                        autoSelect: true,
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.moveDude({ card: card, targetUuid: this.game.townsquare.uuid, options: { needToBoot: true, allowBooted: true } }));
                            this.game.addMessage('{0} uses {1} to kick {2} out of the {3}.', player, this, card, this.getLocationCard());
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