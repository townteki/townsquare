const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FiveAcesGamblingHall extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Five Aces Gambling Hall',
            when: {
                onPossesFormed: () => this.game.shootout && this.game.shootout.mark.owner === this.controller
            },
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude to join',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: false,
                    wanted: true 
                },
                cardType: ['dude'],
                gameAction: 'joinPosse'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to join {2} to posse', 
                    context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context);
            }
        });
    }
}

FiveAcesGamblingHall.code = '20035';

module.exports = FiveAcesGamblingHall;
