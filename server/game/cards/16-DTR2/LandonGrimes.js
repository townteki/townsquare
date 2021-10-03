const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LandonGrimes extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Landon Grimes',
            playType: ['shootout:join'],
            ifCondition: () => this.isParticipating(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails because he is not in your posse', context.player, this),
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current',
                    participating: false,
                    condition: card => card.hasOneOfKeywords(['huckster', 'abomination']) 
                },
                cardType: ['dude'],
                gameAction: 'joinPosse'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} into posse', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context);
            }
        });
    }
}

LandonGrimes.code = '25027';

module.exports = LandonGrimes;
