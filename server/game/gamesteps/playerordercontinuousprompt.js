const _ = require('underscore');
const PlayerOrderPrompt = require('./playerorderprompt.js');

/**
 * Represents a UI Prompt that prompts each player continuously,  in first-player
 * order. Inheritors should call completePlayer() when the prompt for the
 * current player has been completed. Overriding skipCondition will exclude
 * any matching players from the prompt.
 */
class PlayerOrderContinuousPrompt extends PlayerOrderPrompt {
    constructor(game) {
        super(game);

        this.buttons = [
            { arg: this.player, text: 'Done', method: 'noonPlay'},
            { arg: this.player, text: 'Pass', method: 'passToSundown'}
        ];

        this.passedPlayers = [];
    }

    completePlayer() {
        this.lazyFetchPlayers();
        this.passedPlayers.push(this.players.shift());
        return true;
    }

    activePrompt() {
        return {
            menuTitle: 'Actin\', Callin\' Out, Movin\', Shoppin\', or Tradin\'',
            buttons: this.buttons
        };
    }

    noonPlay(player) {
        if(player !== this.currentPlayer) {
            return false;
        }

        this.nextPlayer();
    }

    nextPlayer() {
        this.lazyFetchPlayers();
        
        if(this.passedPlayers.length > 0) {
            this.players.push(this.passedPlayers[0]);
        }
        
        this.players.push(this.players.shift());
    }

    passToSundown(player) {
        if(player !== this.currentPlayer) {
            return false;
        }

        this.completePlayer();
    }

    onMenuCommand(player, arg, method) {
        if(player !== this.currentPlayer) {
            return false;
        }

        if(!this.hasMethodButton(method)) {
            return false;
        }

        if(this[method](player, arg, method)) {
            this.complete();
        }

        return true;
    }

    hasMethodButton(method) {
        return _.any(this.buttons, button => button.method === method);
    }
}

module.exports = PlayerOrderContinuousPrompt;
