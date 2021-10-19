const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ReverendEndicott extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Reverend Endicott',
            when: {
                onCardAttached: event => event.target === this &&
                    event.attachment.hasKeyword('miracle')
            },
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.influence < this.getAttachmentsByKeywords(['miracle']).length 
                },
                cardType: ['dude'],
                gameAction: 'addBounty'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give 1 bounty to {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.target }), context);
            }
        });
    }
}

ReverendEndicott.code = '21024';

module.exports = ReverendEndicott;
