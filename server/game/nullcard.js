class NullCard {
    constructor() {
        this.owner = {
            id: 'game',
            equals: () => false
        };
    }
    
    get controller() {
        return {
            id: 'game',
            equals: () => false
        };
    }

    isUnique() {
        return false;
    }

    isToken() {
        return false;
    }

    isPublic() {
        return false;
    }

    isPrivate() {
        return false;
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

    getPrintedStat() {
        return null;
    }

    getGrit() {
        return null;
    }

    isLocationCard() {
        return false;
    }

    isParticipating() {
        return false;
    }

    isOpposing() {
        return false;
    }

    isOutOfTown() {
        return false;
    }

    isInTownSquare() {
        return false;
    }

    isAtHome() {
        return false;
    }

    isAtDeed() {
        return false;
    }

    isInSameLocation() {
        return false;
    }

    isInControlledLocation() {
        return false;
    }

    isInOpponentsHome() {
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

    isWanted() {
        return false;
    }
    
    hasAttachmentWithKeywords() {
        return false;
    }

    hasAttachment() {
        return false;
    }

    hasHorse() {
        return false;
    }

    hasWeapon() {
        return false;
    }

    canBeCalledOut() {
        return false;
    }

    canAttach() {
        return false;
    }

    isStud() {
        return false;
    }

    isDraw() {
        return false;
    }

    isSkilled() {
        return false;
    }

    isGadget() {
        return false;
    }

    isSpell() {
        return false;
    }

    isSpellcaster() {
        return false;
    }

    isHex() {
        return false;
    }

    isSpirit() {
        return false;
    }

    isMiracle() {
        return false;
    }

    isTotem() {
        return false;
    }

    isTaoTechnique() {
        return false;
    }

    belongsToGang() {
        return false;
    }    

    equals() {
        return false;
    }
}

module.exports = NullCard;
