const DrawCard = require('./drawcard.js');

class JokerCard extends DrawCard {
    get value() {
        return null;
    }

    set value(amount) {
    }

    getMenu() {
        return [{ method: 'discard', text: 'Discard' }];
    }
}

module.exports = JokerCard;
