const DrawCard = require('./drawcard.js');

class JokerCard extends DrawCard {
    getMenu() {
        return [{ method: 'discard', text: 'Discard' }];
    }
}

module.exports = JokerCard;
