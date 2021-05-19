const SpellCard = require('../../spellcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class OwlsInsight extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Owl\'s Insight',
            playType: 'cheatin resolution',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select goods or spells to attach',
                    waitingPromptTitle: 'Waiting for opponent to select goods or spells',
                    cardCondition: card => card.location === 'hand' && card.owner === context.player,
                    cardType: ['goods', 'spell'],
                    multiSelect: true,
                    numCards: 0,
                    onSelect: (player, cards) => {
                        cards.map(card => this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(1), player, card));
                    }
                });
            }
        });
    }
}

OwlsInsight.code = '12018';

module.exports = OwlsInsight;
