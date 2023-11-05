const DudeCard = require('../../dudecard');
const GameActions = require('../../GameActions');

class MarielLewis2 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Mariel Lewis',
            playType: ['shootout'],
            ifCondition: () => (!this.game.shootout.isJob() || !this.game.shootout.belongsToLeaderPlayer(this)) && 
                this.getPosseInfluence(this.controller) > this.getPosseInfluence(this.controller.getOpponent()),
            ifFailMessage: context => {
                if(this.game.shootout.isJob() && this.game.shootout.belongsToLeaderPlayer(this)) {
                    this.game.addMessage('{0} uses {1} but does not send anyone home because they are running a job', 
                        context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1} but does not send anyone home because their posse\'s total influence is not more than the opposing posse\'s', 
                        context.player, this);
                }
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.controller &&
                        card.isParticipating(),
                    cardType: 'dude',
                    gameAction: card => {
                        const actions = ['removeFromPosse'];
                        if(card.gamelocation !== this.gamelocation) {
                            actions.push('moveDude');
                        }
                        return actions;
                    },
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

MarielLewis2.code = '24057';

module.exports = MarielLewis2;
