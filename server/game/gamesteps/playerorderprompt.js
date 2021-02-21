const UiPrompt = require('./uiprompt.js');

/**
 * Represents a UI Prompt that prompts each player individually. Prompt is done in first-player
 * order by default, but customized order can be used by passing player names in desire order 
 * (playerName[0] will be done first). 
 * Inheritors should call completePlayer() when the prompt for the
 * current player has been completed. Overriding skipCondition will exclude
 * any matching players from the prompt.
 */
class PlayerOrderPrompt extends UiPrompt {
    constructor(game, playerNameOrder = []) {
        super(game);
        this.playerNameOrder = playerNameOrder;
    }

    get currentPlayer() {
        this.lazyFetchPlayers();
        return this.players[0];
    }

    lazyFetchPlayers() {
        if(!this.players) {
            if(this.playerNameOrder.length === 0) {
                this.players = this.game.getPlayersInFirstPlayerOrder();
            } else {
                this.players = this.playerNameOrder.map(playerName => this.game.getPlayerByName(playerName));
            }
        }
    }

    skipPlayers() {
        this.lazyFetchPlayers();
        this.players = this.players.filter(p => !this.skipCondition(p));
    }

    skipCondition() {
        return false;
    }

    completePlayer() {
        this.lazyFetchPlayers();
        this.players.shift();
    }

    setPlayers(players) {
        this.players = players;
    }

    isComplete() {
        this.lazyFetchPlayers();
        return this.players.length === 0;
    }

    activeCondition(player) {
        return player === this.currentPlayer;
    }

    continue() {
        this.skipPlayers();
        return super.continue();
    }
}

module.exports = PlayerOrderPrompt;
