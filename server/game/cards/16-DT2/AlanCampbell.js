const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class AlanCampbell extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Noon: Alan Campbell',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select a dude to callout',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.influence === 0 &&
                        card.gamelocation === this.gamelocation
                },
                cardType: ['dude'],
                gameAction: 'callout'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to call out {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ caller: this, callee: context.target }), context);
            }
        });
    }
}

AlanCampbell.code = '24046';

module.exports = AlanCampbell;
