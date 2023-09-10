const LocationCard = require('./locationcard.js');

class DeedCard extends LocationCard {
    get controller() {
        if(this.location === 'play area' && this.gameLocationObject) {
            this.controller = this.gameLocationObject.determineController();
        }
        return this.controllingPlayer;
    }

    set controller(controller) {
        this.controllingPlayer = controller;
    }

    isPrivate() {
        return this.hasKeyword('Private');
    }

    isPublic() {
        return this.hasKeyword('Public');
    }

    isCore() {
        const foundKeywords = this.getCoreKeyword();
        return !!foundKeywords;
    }

    getCoreKeyword() {
        const foundKeywords = this.findKeywords(keyword => keyword.toLowerCase().startsWith('core'));
        if(foundKeywords && foundKeywords.length) {
            return foundKeywords[0];
        }
    }

    getCoreFaction() {
        const coreKeyword = this.getCoreKeyword();
        if(!coreKeyword) {
            return;
        }
        const keywordWords = coreKeyword.split(' ');
        if(keywordWords.length < 2) {
            return 'NONE';
        }
        return keywordWords.slice(1).join('');
    }

    isSameStreet(card) {
        if(this.isOutOfTown()) {
            return false;
        }
        if(card.getType() === 'deed' && card.isOutOfTown()) {
            return false;
        }
        if(card.getType() === 'outfit' && this.owner.equals(card.owner)) {
            return true;
        }
        return this.owner.locations.some(location => location.uuid === card.uuid);
    }
}

module.exports = DeedCard;
