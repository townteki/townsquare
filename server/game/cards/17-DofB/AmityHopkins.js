const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class AmityHopkins extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Boot a Dude',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select a dude to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    wanted: true,
                    condition: card => card.isInSameLocation(this)
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            message: context => this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });
    }
}

AmityHopkins.code = '25017';

module.exports = AmityHopkins;
