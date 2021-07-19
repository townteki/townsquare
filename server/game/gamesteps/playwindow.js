const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');

class PlayWindow extends ContinuousPlayerOrderPrompt {
    constructor(game, name, activePromptTitle, playerNameOrder = []) {
        super(game, activePromptTitle, playerNameOrder);
        this.name = name;
        this.playWindowOpened = false;
        this.orderPassed = true;
        this.onDone = (player) => {
            if(player !== this.currentPlayer) {
                return false;
            }
            if(player.unscriptedCardPlayed && player.unscriptedCardPlayed.location === 'being played') {
                if(player.unscriptedCardPlayed.hasKeyword('technique') && player.unscriptedCardPlayed.isTaoTechnique()) {
                    const kfDude = player.unscriptedPull ? player.unscriptedPull.pullingDude : null;
                    const isSuccessful = player.unscriptedPull ? player.unscriptedPull.isSuccessful : null;
                    player.handleTaoTechniques(player.unscriptedCardPlayed, kfDude, isSuccessful);
                } else {
                    player.moveCard(player.unscriptedCardPlayed, 'discard pile');
                }
            }
            if(player) {
                player.unscriptedCardPlayed = null;
                player.unscriptedPull = null;
            }
            this.orderPassed = true;
            this.nextPlayer();
        };
        this.onPass = (player) => {
            if(player !== this.currentPlayer) {
                return false;
            }
            if(player) {
                player.unscriptedCardPlayed = null;
            }
            this.orderPassed = true;
            this.completePlayer();
        };
    }

    skipCondition() {
        if(this.game.shootout && this.game.shootout.checkEndCondition()) {
            return true;
        }
        return false; 
    }

    activePrompt(player) {
        let title = this.activePromptTitle;
        if(player.unscriptedCardPlayed) {
            const unscriptedText = player.unscriptedCardPlayed.cardData.scripted ? '' : ' unscripted';
            title = `Playing${unscriptedText} card ${player.unscriptedCardPlayed.title}`;
            this.buttons = [
                { arg: this.player, text: 'Done', method: 'onDone'}
            ];
        } else {
            this.buttons = [
                { arg: this.player, text: 'Pass', method: 'onPass'}
            ];            
        }
        return {
            menuTitle: title,
            buttons: this.buttons
        };
    }

    continue() {
        let result = super.continue();

        if(!this.isComplete()) {
            if(!this.playWindowOpened || !this.game.currentPlayWindow) {
                this.game.currentPlayWindow = this;
                this.playWindowOpened = true;
                this.game.raiseEvent('onPlayWindowOpened', { playWindow: this });
            } else {
                if(!this.game.isLegacy() && this.name === 'shootout plays' && this.orderPassed) {
                    this.currentPlayer.checkAndPerformCombo();
                }
                this.orderPassed = false;
            }
        } else {
            this.game.currentPlayWindow = null;
            this.game.raiseEvent('onPlayWindowClosed', { playWindow: this });
        }

        return result;
    }

    markActionAsTaken(player) {
        this.onDone(player);
    }

    completePlayer() {
        this.game.raiseEvent('onPassAction', { playWindow: this });
        this.game.addMessage('{0} passes {1} action', this.currentPlayer, this.name);
        super.completePlayer();
    }
}

module.exports = PlayWindow;
