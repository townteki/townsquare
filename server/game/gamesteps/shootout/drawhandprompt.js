const UiPrompt = require('../uiprompt');

class DrawHandPrompt extends UiPrompt {
    constructor(game, drawCounts) {
        super();
        this.game = game;
        this.players = game.getPlayers();
        this.drawCounts = drawCounts;
        if (this.drawCounts == null) {
            this.drawCounts = this.players.map(player => {
                return { player: player, number: 5, handDrawn: false };
            });            
        }       
        this.players.forEach(player => this.updateDrawCount(player));
    }

    activeCondition(player) {
        return !player.drawHandSelected;
    }

    getDrawCount(player) {
        return this.drawCounts.find(drawCount => drawCount.player === player);
    }

    activePrompt(player) {
        if (!this.getDrawCount(player).handDrawn) {
            let drawCount = this.getDrawCount(player);
            return {
                menuTitle: 'Draw shootout hand',
                buttons: [
                    { text: ' + Cards', arg: 'moreCards' },
                    { text: 'Draw ' + drawCount.number + ' Cards', arg: 'draw' },
                    { text: ' - Cards', arg: 'lessCards' }
                ]
            };
        } else {
            return {
                menuTitle: 'Reveal draw hand?',
                buttons: [
                    { arg: 'revealdraw', text: 'Ready' }
                ]
            };
        }
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to reveal draw hand' };
    }

    isComplete() {
        return this.players.every(player => player.drawHandSelected);
    }

    continue() {
        if (this.game.currentPhase === 'gambling') {
            // in gambling phase hands are drawn in separate step before this prompt
            this.drawCounts.forEach(drawCount => drawCount.handDrawn = true);
        }

        return super.continue();
    }    

    updateDrawCount(player, amount = 0) {
        let drawCount = this.getDrawCount(player);
        drawCount.number += amount;
        drawCount.number = drawCount.number < 5 ? 5 : drawCount.number;        
    }

    onMenuCommand(player, arg) {
        if (arg === 'draw') {
            let drawCount = this.getDrawCount(player);
            player.drawCardsToHand(drawCount.number, 'draw hand');
            this.getDrawCount(player).handDrawn = true;
            return false;
        }
        if (arg === 'moreCards') {
            this.updateDrawCount(player, 1);
            return false;
        }
        if (arg === 'lessCards') {
            this.updateDrawCount(player, -1);
            return false;
        }
        if (arg === 'revealdraw') {
            player.drawHandSelected = true;   
            this.game.addMessage('{0} is ready to reveal their draw hand', player);
            return true;
        }
        return false;
    }

}

module.exports = DrawHandPrompt;
