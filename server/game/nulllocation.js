class NullLocation {
    constructor() {
        this.adjacencyMap = new Map();
        this.occupants = [];
    }

    getDudes() {
        return [];
    }

    isAdjacent() {
        return false;
    }

    isTownSquare() {
        return false;
    }

    isOutfit() {
        return false;
    }

    isDeed() {
        return false;
    }

    isHome() {
        return false;
    }

    isOutOfTown() {
        return false;
    }

    isOpponentsHome() {
        return false;
    }
}

module.exports = NullLocation;
