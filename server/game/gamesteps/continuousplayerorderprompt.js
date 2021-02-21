const _ = require('underscore');
const PlayerOrderPrompt = require('./playerorderprompt.js');

/**
 * Represents a UI Prompt that prompts each player continuously.
 * Prompt is done in first-player order by default, but customized order 
 * can be used by passing player names in desire order (playerName[0] will be done first). 
 * Inheritors should call completePlayer() when the prompt for the
 * current player has been completed. Overriding skipCondition will exclude
 * any matching players from the prompt.
 */
class ContinuousPlayerOrderPrompt extends PlayerOrderPrompt {
    constructor(game, activePromptTitle, playerNameOrder = [], buttonFunctions = {}) {
        super(game, playerNameOrder);
        this.activePromptTitle = activePromptTitle;
        if(buttonFunctions.onDone) {
            this.onDone = buttonFunctions.onDone;
        } else {
            this.onDone = (player) => {
                if(player !== this.currentPlayer) {
                    return false;
                }      
                this.nextPlayer();
            };
        }
        if(buttonFunctions.onPass) {
            this.onPass = buttonFunctions.onPass;
        } else {
            this.onPass = (player) => {
                if(player !== this.currentPlayer) {
                    return false;
                }       
                this.completePlayer();
            };
        }

        this.buttons = [
            { arg: this.player, text: 'Done', method: 'onDone'},
            { arg: this.player, text: 'Pass', method: 'onPass'}
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
            menuTitle: this.activePromptTitle,
            buttons: this.buttons
        };
    }

    nextPlayer() {
        this.lazyFetchPlayers();
        
        if(this.passedPlayers.length > 0) {
            this.players.push(this.passedPlayers.shift());
        }
        
        this.players.push(this.players.shift());
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

module.exports = ContinuousPlayerOrderPrompt;
