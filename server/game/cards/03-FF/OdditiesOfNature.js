const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class OdditiesOfNature extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.getType() === 'dude' &&
                card.hasKeyword('abomination') &&
                card.isInTownSquare(),
            effect: ability.effects.modifyInfluence(1)
        });

        this.action({
            title: 'Noon: Oddities of Nature',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => card.location === 'play area' &&
                    card.controller === this.owner &&
                    card.getType() === 'dude' &&
                    card.hasKeyword('abomination') &&
                    card.isInTownSquare())
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to gain 1 GR', context.player, this, context.costs.boot),
            handler: context => {
                context.player.modifyGhostRock(1);
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose a dude to boot',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== context.player &&
                        card.isInTownSquare(),
                    cardType: 'dude',
                    gameAction: 'boot',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to boot {2}', player, this, card);
                        });                        
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

OdditiesOfNature.code = '05001';

module.exports = OdditiesOfNature;
