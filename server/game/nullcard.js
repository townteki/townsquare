class NullCard {
    hasKeyword() {
        return false;
    }

    hasOneOfKeywords() {
        return false;
    }

    hasAllOfKeywords() {
        return false;
    }

    getType() {
        return '';
    }

    isLocationCard() {
        return false;
    }
}

module.exports = NullCard;
