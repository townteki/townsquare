const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Tsintah extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Tsintah',
            playType: ['shootout'],
            cost: ability.costs.boot(card => card.parent && (
                (card.parent === this && card.hasKeyword('spirit')) ||
                (card.parent.gamelocation === this.gamelocation && card.hasKeyword('totem')))
            ),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
                const thisLocationCard = this.locationCard;
                if(!thisLocationCard) {
                    return;
                }
                const isAdjacentToHolyGround = thisLocationCard.getType('deed') && this.game.findLocations(card => 
                    card.hasKeyword('holy ground') && card.isAdjacent(this.gamelocation)).length > 0;
                if(thisLocationCard.hasKeyword('holy ground') || isAdjacentToHolyGround) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.modifyBullets(1)
                    }));
                    this.game.addMessage('{0} uses {1} to give her +1 bullets and make her a stud', context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1} to make her a stud', context.player, this);
                }
            }
        });
    }
}

Tsintah.code = '22017';

module.exports = Tsintah;
