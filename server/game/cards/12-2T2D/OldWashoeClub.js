const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class OldWashoeClub extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Send A-dude home booted',
            cost: ability.costs.bootSelf(),
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose an opposing A-value dude',
                choosingPlayer: 'current',
                cardCondition: {
                    location: 'play area', 
                    controller: 'opponent',
                    participating: true,
                    condition: card => card.value === 1
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
                this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target);
            }
        });
        this.action({
            title: 'Shootout: Discard a Sidekick',
            cost: ability.costs.bootSelf(),
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a sidekick',
                choosingPlayer: 'current',
                cardCondition: {
                    location: 'play area', 
                    participating: true,
                    condition: card => card.hasKeyword('sidekick')
                },
                cardType: ['goods'],
                gameAction: 'discard'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target);
            }
        });
    }
}

OldWashoeClub.code = '20036';

module.exports = OldWashoeClub;
