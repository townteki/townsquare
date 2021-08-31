const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class IvorHawleyExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.outfit.gang_code === 'fearmongers', 
            effect: ability.effects.reduceSelfCost('any', () => this.getNumOfAboms())
        });

        this.reaction({
            title: 'React: Ivor Hawley',
            when: {
                onCardEntersPlay: event => event.card === this && 
                    event.originalLocation === 'hand'
            },
            target: {
                activePromptTitle: 'Choose up to 2 cards',
                cardCondition: { 
                    location: 'dead pile', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('hex') || card.hasKeyword('abomination') 
                },
                cardType: ['dude', 'spell'],
                numCards: 2,
                multiSelect: true
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to put {2} into play reducing their cost by 3 each', context.player, this, context.target),
            handler: context => {
                context.target.forEach(target =>
                    this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(3), context.player, target)
                );
            }
        });
    }

    getNumOfAboms() {
        const cardsInPlayAndBH = this.controller.cardsInPlay.concat(this.controller.deadPile);
        return cardsInPlayAndBH.reduce((num, card) => {
            if(card.hasKeyword('abomination')) {
                return num + 1;
            }
            return num;
        }, 0);
    }
}

IvorHawleyExp1.code = '10011';

module.exports = IvorHawleyExp1;
