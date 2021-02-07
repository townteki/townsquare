const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class HunterProtections extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Hunter Protections',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude to protect',
                cardCondition: { location: 'play area', condition: card => 
                    card.control <= 0 && 
                    !card.booted && 
                    card.getLocationCard() === this
                },
                cardType: ['dude']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target })).
                    thenExecute(event => {
                        if (event.card.booted) {
                            this.game.resolveGameAction(GameActions.addBounty({ card: event.card, amount: 2 }));
                            event.card.modifyControl(1);
                            this.game.addMessage('{0} uses {1} to protect {2} who boots, gts 2 bounty and 1 permanent control point.', context.player, this, context.target);
                        } else {
                            this.game.addMessage('{0} uses {1} to try to protect {2} but fails because they cannot boot.', context.player, this, context.target);
                        }
                    });

                
            }
        });
    }
}

HunterProtections.code = '04013';

module.exports = HunterProtections;