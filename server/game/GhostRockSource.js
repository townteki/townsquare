class GhostRockSource {
    constructor(playerOrCard, allowSpendingFunc = () => true) {
        this.playerOrCard = playerOrCard;
        this.allowSpendingFunc = allowSpendingFunc;
    }

    get ghostrock() {
        return this.playerOrCard.ghostrock;
    }

    get name() {
        if(this.playerOrCard.getGameElementType() === 'player') {
            return `${this.playerOrCard.name}'s stash`;
        }

        return this.playerOrCard.title;
    }

    allowSpendingFor(spendParams) {
        return this.allowSpendingFunc(spendParams);
    }

    modifyGhostRock(amount) {
        this.playerOrCard.modifyGhostRock(amount);
    }
}

module.exports = GhostRockSource;
