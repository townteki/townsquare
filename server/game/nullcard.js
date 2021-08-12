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

    isOutOfTown() {
        return false;
    }

    allowGameAction() {
        return true;
    }

    isAdjacent() {
        return false;
    }

    adjacentLocations() {
        return [];
    }
}

module.exports = NullCard;
