const ActionCard = require('./actioncard.js');

class TechniqueCard extends ActionCard {
    isSameTao(card) {
        if(!card.getType() === 'action' || !card.hasKeyword('technique')) {
            return false;
        }
        const cardTaoKeywords = card.getTaoKeywords();
        if(cardTaoKeywords.length <= 0) {
            return false;
        }
        const thisTaoKeywords = this.getTaoKeywords();
        if(thisTaoKeywords.length <= 0) {
            return false;
        }
        return thisTaoKeywords[0] === cardTaoKeywords[0];
    }

    isTaoTechnique() {
        return this.getTaoKeywords().length > 0;
    }

    getTaoKeywords() {
        return this.findKeywords(keyword => keyword.toLowerCase().startsWith('tao of'));
    }

    getComboAbility() {
        return this.abilities.actions.find(action => action.combo);
    }
}

module.exports = TechniqueCard;
