const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DrErikYaple extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Dr. Erik Yaple',
            when: {
                onPossesFormed: () => true
            },
            cost: ability.costs.boot(card => card.isParticipating() &&
                card.controller === this.controller &&
                card.hasAllOfKeywords(['weapon', 'gadget'])),
            target: {
                activePromptTitle: 'Choose a dude to add bounty',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    wanted: false,
                    participating: true 
                },
                cardType: ['dude'],
                gameAction: 'addBounty'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to add bounty to {3}', 
                    context.player, this, context.costs.boot, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.target }), context);
            }
        });
    }
}

DrErikYaple.code = '20019';

module.exports = DrErikYaple;
