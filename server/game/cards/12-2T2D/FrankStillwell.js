const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class FrankStillwell extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && 
                    event.card === this &&
                    event.card.isWanted()
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context).thenExecute(() => {
                    this.game.addMessage('{0} unboots {1} after {1} joined the posse', context.player, this);
                });
            }
        });
        
        this.reaction({
            title: 'React: Frank Stillwell',
            when: {
                onPossesFormed: () => this.isParticipating()
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to send {1} home booted', context.player, this),
            handler: context => {
                this.game.shootout.sendHome(this, context);
            }
        });
    }
}

FrankStillwell.code = '20027';

module.exports = FrankStillwell;
