const GoodsCard = require('../../goodscard.js');

class TlalocsFuries extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, true, true);
    }

    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getNumberOfTlalocs())
        });
        this.whileAttached({
            effect: [
                ability.effects.dynamicSkillRating('huckster', () => this.getNumberOfTlalocs()),
                ability.effects.dynamicSkillRating('blessed', () => this.getNumberOfTlalocs()),
                ability.effects.dynamicSkillRating('shaman', () => this.getNumberOfTlalocs()),
                ability.effects.dynamicSkillRating('mad scientist', () => this.getNumberOfTlalocs())
            ]
        });
    }

    getNumberOfTlalocs() {
        const tlalocs = this.game.filterCardsInPlay(card => card.code === '11017');
        return tlalocs.length;
    }
}

TlalocsFuries.code = '11017';

module.exports = TlalocsFuries;
