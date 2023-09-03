const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class EmptySchell extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Send Dude home booted',
            triggerBefore: true,
            when: {
                onCasualtyChosen: event => this.equals(event.card)
            },
            target: {
                activePromptTitle: 'Select dude to send home',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: 'sendHome'
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to send {2} home', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ 
                    card: context.target, 
                    options: { needToBoot: false } 
                }), context);
            }
        });
    }
}

EmptySchell.code = '25009';

module.exports = EmptySchell;
