const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class TheGreyMan extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'The Grey Man',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select a dude to send home booted',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: {
                    condition: card => card.gamelocation === this.gamelocation && card.value <= this.bullets
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            message: context => this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target),
            handler: context => this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context)
        });
    }
}

TheGreyMan.code = '17009';

module.exports = TheGreyMan;
