const DudeCard = require('../../dudecard');
const GameActions = require('../../GameActions');

class MarielLewis extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Mariel Lewis',
            playType: ['shootout'],
            ifCondition: () => this.getPosseInfluence(this.controller) > this.getPosseInfluence(this.controller.getOpponent()),
            ifFailMessage: context => {
                this.game.addMessage('{0} uses {1} but does not send anyone home because their posse\'s total influence is not more than the opposing posse\'s', 
                    context.player, this);
            },
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                ifAble: true,
                gameAction: 'sendHome'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target, options: { needToBoot: false }}), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to send {2} home without booting', context.player, this, context.target);
                });
            }
        });
    }

    getPosseInfluence(player) {
        let playerPosseDudes = this.game.shootout.getPosseByPlayer(player).getDudes();
        return playerPosseDudes.reduce((memo, dude) => memo + dude.influence, 0);
    }
}

MarielLewis.code = '12004';

module.exports = MarielLewis;
