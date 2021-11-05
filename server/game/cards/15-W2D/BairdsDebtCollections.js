const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BairdsDebtCollections extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onCardEntersPlay: event => event.card !== this && event.card.getType() === 'deed' &&
                    ['shoppin', 'ability'].includes(event.playingType)
            },
            handler: () => {
                this.controller.modifyGhostRock(1);
                this.game.addMessage('{0} collects 1 GR thanks to {1}', this.controller, this);
            }
        });

        this.action({
            title: 'Noon: Baird\'s Debt Collections',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand()
            ],
            target: {
                activePromptTitle: 'Choose a deed to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card !== this &&
                        !card.booted 
                },
                cardType: ['deed'],
                gameAction: 'boot'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });
    }
}

BairdsDebtCollections.code = '23033';

module.exports = BairdsDebtCollections;
