class NullCard {
    get controller() {
        return {
            id: 'game',
            equals: () => false
        };
    }

    get owner() {
        return {
            id: 'game',
            equals: () => false
        };
    }

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

    isNearby() {
        return false;
    }
    
    hasAttachmentWithKeywords() {
        return false;
    }

    equals() {
        return false;
    }
}

module.exports = NullCard;
