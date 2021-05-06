const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class DaveSlimGorman extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Dave "Slim" Gorman',
            when: {
                onPullSuccess: event => 
                    event.pullingDude === this &&
                    event.source.getType() === 'spell' && 
                    event.source.isHex() &&
                    event.context && event.context.ability.playTypePlayed() === 'shootout'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to make all dudes in the shootout draws for the round', 
                    context.player, this, context.event.source),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.event.source }), context).thenExecute(() => {
                    this.untilEndOfShootoutRound(ability => ({
                        match: this.game.shootout.getParticipants(),
                        effect: ability.effects.setAsDraw()
                    }));
                });
            }
        });
    }
}

DaveSlimGorman.code = '18042';

module.exports = DaveSlimGorman;
