const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class UrsulaTheWormQueen extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.getFaction() === Factions.Fearmongers, 
            effect: ability.effects.reduceSelfCost('any', () => this.getNumOfHucksters())
        });

        this.action({
            title: 'Noon: Ursula, the Worm Queen',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a Hex to reattach',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.parent &&
                        card.parent !== this &&
                        card.parent.owner === this.controller &&
                        card.hasKeyword('hex') 
                },
                cardType: ['spell']
            },
            handler: context => {
                const originalParent = context.target.parent;
                context.player.attach(context.target, this, 'ability', () => {
                    this.game.addMessage('{0} uses {1} to reattach {2} from {3} to Ursula', 
                        context.player, this, context.target, originalParent);
                    if(context.target.booted) {
                        context.player.discardFromHand(1, discarded => {
                            this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                                context.target.resetAbilities();
                                this.game.addMessage('{0} uses {1} and discards {2} to unboot {3} and its abilities can be used another time', 
                                    context.player, this, discarded, context.target);
                            });
                        });
                    }
                });
            }
        });
    }

    getNumOfHucksters() {
        return this.controller.cardsInPlay.reduce((num, card) => {
            if(card.getType() === 'dude' && card.hasKeyword('huckster')) {
                return num + 1;
            }
            return num;
        }, 0);
    }
}

UrsulaTheWormQueen.code = '25039';

module.exports = UrsulaTheWormQueen;
