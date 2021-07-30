const DudeCard = require('../../dudecard');
const GameActions = require('../../GameActions');

class MarielLewis2 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Mariel Lewis',
            playType: ['shootout'],
            ifCondition: () => !this.game.shootout.isJob() && 
                this.getPosseInfluence(this.controller) > this.getPosseInfluence(this.controller.getOpponent()),
            ifFailMessage: context => {
                this.game.addMessage('{0} uses {1} but does not send anyone home because their posse\'s total influence is not more than the opposing posse\'s', 
                    context.player, this);
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Choose a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.controller &&
                        card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.sendHome({ card, options: { needToBoot: false }}), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to send {2} home without booting', player, this, card);
                        });
                        return true;
                    }
                });
            }
        });
    }

    getPosseInfluence(player) {
        let playerPosseDudes = this.game.shootout.getPosseByPlayer(player).getDudes();
        return playerPosseDudes.reduce((memo, dude) => memo + dude.influence, 0);
    }
}

MarielLewis2.code = '25045';

module.exports = MarielLewis2;
