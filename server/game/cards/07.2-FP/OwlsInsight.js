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
                this.doneSelecting = false;
                this.owlAction(context);
            }
        });
    }

    processSpellOrGoods(context) {
        if(!this.doneSelecting) {
            this.game.promptForSelect(context.player, {
                activePromptTitle: 'Select goods or spells to attach',
                waitingPromptTitle: 'Waiting for opponent to select goods or spells',
                cardCondition: card => card.location === 'hand' && card.owner === context.player,
                cardType: ['goods', 'spell'],
                onSelect: (player, card) => {
                    this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(1), player, card);
                    this.game.queueSimpleStep(() => {
                        this.owlAction(context);
                    });
                    return true;
                },
                onCancel: () => {
                    this.doneSelecting = true;
                    context.player.redrawToHandSize();
                },
                source: this
            });
        }
    }

    owlAction(context) {
        const spellsAndGoodsNumber = context.player.hand.filter(card => ['spell', 'goods'].includes(card.getType())).length;
        if(spellsAndGoodsNumber > 0 && !this.doneSelecting) {
            this.processSpellOrGoods(context);
        } else {
            context.player.redrawToHandSize();
        }
    }
}

OwlsInsight.code = '12018';

module.exports = OwlsInsight;
