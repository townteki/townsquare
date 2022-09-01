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
                        if(this.isSuitRed(pulledSuit1) && this.isSuitRed(pulledSuit2)) {
                            this.locationCard.modifyControl(1);
                            this.game.addMessage('{0} uses {1} and boots {2} to give {3} a permanent CP', 
                                context.player, this, context.costs.boot, this.locationCard);
                        } else if(this.isSuitRed(pulledSuit1) || this.isSuitRed(pulledSuit2)) {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: this.locationCard,
                                effect: ability.effects.modifyControl(1)
                            }));
                            this.game.addMessage('{0} uses {1} and boots {2} to give {3} a CP', 
                                context.player, this, context.costs.boot, this.locationCard);
                        } else {
                            this.game.addMessage('{0} uses {1} and boots {2}, but it does not have any effect', 
                                context.player, this, context.costs.boot);
                        }
                    }, true, { context });
                }, true, { context });
            }
        });
    }

    isSuitRed(suit) {
        return suit && (suit.toLowerCase() === 'hearts' || suit.toLowerCase() === 'diams');
    }
}

RobertoMuratore.code = '21028';

module.exports = RobertoMuratore;
