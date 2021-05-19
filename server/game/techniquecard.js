const ActionCard = require('./actioncard.js');

class TechniqueCard extends ActionCard {
    isSameTao(card) {
        if(!card.getType() === 'action' || !card.hasKeyword('technique')) {
            return false;
        }
        const cardTaoKeywords = card.findKeywords(keyword => keyword.toLowerCase().startsWith('tao of'));
        if(cardTaoKeywords.length <= 0) {
            return false;
        }
        const thisTaoKeywords = this.findKeywords(keyword => keyword.toLowerCase().startsWith('tao of'));
        if(thisTaoKeywords.length <= 0) {
            return false;
        }
        return thisTaoKeywords[0] === cardTaoKeywords[0];
    }
}

module.exports = TechniqueCard;
