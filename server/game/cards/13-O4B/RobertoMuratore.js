const DudeCard = require('../../dudecard.js');

class RobertoMuratore extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Roberto Muratore',
            playType: ['noon'],
            condition: () => this.locationCard && !this.isInOutOfTown() &&
                this.locationCard.getType() === 'deed' && this.locationCard.control === 1, 
            cost: ability.costs.boot(card =>
                card.parent === this &&
                card.getType() === 'goods' &&
                card.isGadget() &&
                card.hasKeyword('experimental') 
            ),
            handler: context => {
                context.player.pull((pulledCard1, pulledValue1, pulledSuit1) => {
                    context.player.pull((pulledCard2, pulledValue2, pulledSuit2) => {
                        if(!this.locationCard) {
                            return;
                        }
                        if(pulledSuit1 === 'Hearts' && pulledSuit2 === 'Hearts') {
                            this.locationCard.modifyControl(1);
                            this.game.addMessage('{0} uses {1} and boots {2} to give {3} a permanent CP', 
                                context.player, this, context.costs.boot, this.locationCard);
                        } else if(pulledSuit1 === 'Hearts' || pulledSuit2 === 'Hearts') {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: this.locationCard,
                                effect: ability.effects.modifyControl(1)
                            }));
                            this.game.addMessage('{0} uses {1} and boots {2} to give {3} a CP', 
                                context.player, this, context.costs.boot, this.locationCard);
                        }
                    }, true, { context });
                }, true, { context });
            }
        });
    }
}

RobertoMuratore.code = '21028';

module.exports = RobertoMuratore;
