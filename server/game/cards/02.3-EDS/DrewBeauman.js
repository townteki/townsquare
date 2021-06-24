const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class DrewBeauman extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin() &&
                    !this.controller.isCheatin() &&
                    this.isInControlledLocation() &&
                    this.controller.hand.find(card => card.hasKeyword('gadget'))
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a gadget',
                    waitingPromptTitle: 'Waiting for opponent to select gadget',
                    cardCondition: card => card.location === 'hand' &&
                        card.controller === this.controller &&
                        card.hasKeyword('gadget'),
                    cardType: 'goods',
                    onSelect: (player, card) => {
                        this.lastingEffect(context.ability, ability => ({
                            until: {
                                onDrewBeaumanFinished: () => true
                            },
                            match: card,
                            targetLocation: card.location,
                            effect: ability.effects.canBeInventedWithoutBooting()
                        }));  
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playType: 'ability',
                            sourceType: 'ability',
                            scientist: this
                        }, () => {
                            this.game.addMessage('{0} invents {1} without booting thanks to {2}', player, card, this);
                        }), player, card);                   
                        this.game.queueSimpleStep(() => { 
                            this.game.raiseEvent('onDrewBeaumanFinished'); 
                        });                         
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

DrewBeauman.code = '04004';

module.exports = DrewBeauman;
