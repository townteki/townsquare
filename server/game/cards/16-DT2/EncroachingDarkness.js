const OutfitCard = require('../../outfitcard.js');

class EncroachingDarkness extends OutfitCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            effect: ability.effects.reduceFirstCardCostEachRound(1, card => 
                card.location === 'hand' &&
                card.getType() === 'dude' && 
                card.hasKeyword('abomination'))
        });

        this.action({
            title: 'Noon: Encroaching Darkness',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.location === 'play area' &&
                    card.getType() === 'dude'    
                )
            ],
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose an opposing dude',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.controller &&
                        card.value < context.costs.boot.value &&
                        card.isInSameLocation(context.costs.boot),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: card,
                            effect: ability.effects.modifyInfluence(-1)
                        }));
                        if(context.costs.boot.hasKeyword('abomination')) {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: card,
                                effect: ability.effects.modifyBullets(-1)
                            }));
                            this.game.addMessage('{0} uses {1} and boots {2} to reduce {3}\'s influence and bullets by 1', 
                                player, this, context.costs.boot, card);
                        } else {
                            this.game.addMessage('{0} uses {1} and boots {2} to reduce {3}\'s influence by 1', 
                                player, this, context.costs.boot, card);
                        }                        
                        return true;
                    }
                });
            }
        });
    }
}

EncroachingDarkness.code = '24005';

module.exports = EncroachingDarkness;
