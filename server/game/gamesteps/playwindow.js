const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');
const MenuPrompt = require('./menuprompt.js');

class PlayWindow extends ContinuousPlayerOrderPrompt {
    constructor(game, name, activePromptTitle, playerNameOrder = []) {
        super(game, activePromptTitle, playerNameOrder);
        this.name = name;
        this.playWindowOpened = false;
        this.orderPassed = true;
        this.doNotMarkActionAsTaken = false;
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
            if(this.name === 'high noon' && player.isInCheck()) {
                this.game.promptForYesNo(player, {
                    title: 'You are in CHECK, do you really want to Pass?',
                    onYes: player => this.completePlayer(player)                
                });
            } else {
                this.completePlayer(player);
            }
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
                if(this.name === 'shootout plays' && this.orderPassed) {
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
        this.game.checkWinCondition();
        this.onDone(player);
    }

    completePlayer(player) {
        if(player) {
            player.unscriptedCardPlayed = null;
        }
        this.orderPassed = true;        
        this.game.raiseEvent('onPassAction', { playWindow: this, player });
        this.game.addMessage('{0} passes {1} action', player, this.name);
        if(this.game.isSolo() && this.passedPlayers.length) {
            this.passedPlayers.push(this.game.automaton);
            this.players = [];
        } else {
            this.soloCompleted = false;
            super.completePlayer();
        }
    }

    makePlayOutOfOrder(player, card, properties = {}) {
        this.doNotMarkActionAsTaken = true;
        const buttons = properties.buttons || [];
        if(!properties.noCancelButton) {
            buttons.push({ text: 'Cancel', method: 'onMakePlayDone' });
        }
        this.outOfOrderMenuPrompt = new MenuPrompt(this.game, player, this, {
            activePrompt: {
                menuTitle: properties.title || 'Make a play',
                buttons,
                promptTitle: card.title
            },
            source: card
        });
        this.game.queueStep(this.outOfOrderMenuPrompt);
    }

    onPassOutOfOrder(player) {
        if(player !== this.currentPlayer) {
            this.nextPlayer();
        }
        this.onPass(player);
        return true;
    }

    onMakePlayDone() {
        if(this.outOfOrderMenuPrompt) {
            this.outOfOrderMenuPrompt.complete();
        }
        this.doNotMarkActionAsTaken = false;
        this.outOfOrderMenuPrompt = null;
        return true;
    }

    nextPlayer() {
        if(this.game.isSolo() && this.currentPlayer !== this.game.automaton) {
            this.passedPlayers = [];
        }
        const savePassedForSolo = [...this.passedPlayers];
        super.nextPlayer();
        if(this.game.isSolo()) {
            this.passedPlayers = savePassedForSolo;
            if(this.currentPlayer === this.game.automaton) {
                this.soloCompleted = false;
            }
        }
    }
    
    handleSolo() {
        this.game.automaton.handlePlayWindow(this);
    }

    canHandleSolo() {
        return !this.soloCompleted && this.currentPlayer === this.game.automaton;
    }
}

module.exports = PlayWindow;
