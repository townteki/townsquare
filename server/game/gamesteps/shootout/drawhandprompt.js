const UiPrompt = require('../uiprompt');

class DrawHandPrompt extends UiPrompt {
    constructor(game, drawCounts) {
        super();
        this.game = game;
        this.players = game.getPlayers();
        this.drawCounts = drawCounts;
        if(!this.drawCounts) {
            this.drawCounts = this.players.map(player => {
                return { player: player, number: 5, handDrawn: false, handRedrawn: false };
            });            
        }
        this.selectedCards = [];
        this.players.forEach(player => this.updateDrawCount(player));
    }

    activeCondition(player) {
        return !player.drawHandSelected;
    }

    getDrawCount(player) {
        return this.drawCounts.find(drawCount => drawCount.player === player);
    }

    activePrompt(player) {
        if(!this.getDrawCount(player).handDrawn) {
            let drawCount = this.getDrawCount(player);
            return {
                menuTitle: 'Draw shootout hand',
                buttons: [
                    { text: ' + Cards', arg: 'moreCards' },
                    { text: 'Draw ' + drawCount.number + ' Cards', arg: 'draw' },
                    { text: ' - Cards', arg: 'lessCards' }
                ]
            };
        } else if(!this.getDrawCount(player).handRedrawn) {
            return {
                menuTitle: 'Select up to ' + this.getDrawCount(player).redraw + ' cards to redraw',
                buttons: [
                    { arg: 'redraw', text: 'Done' }
                ],
                selectCard: true
            };
        } 
        return {
            menuTitle: 'Reveal draw hand?',
            buttons: [
                { arg: 'revealdraw', text: 'Ready' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to reveal draw hand' };
    }

    isComplete() {
        return this.players.every(player => player.drawHandSelected);
    }

    continue() {
        if(this.game.currentPhase === 'gambling') {
            // in gambling phase hands are drawn in separate step before this prompt
            this.drawCounts.forEach(drawCount => {
                drawCount.handDrawn = true;
                drawCount.handRedrawn = true;
            });
        }

        return super.continue();
    }    

    updateDrawCount(player, amount = 0) {
        let drawCount = this.getDrawCount(player);
        drawCount.number += amount;
        drawCount.number = drawCount.number < 5 ? 5 : drawCount.number;        
    }

    onCardClicked(player, card) {
        if(card.location !== 'draw hand') {
            return false;
        }

        if(this.selectedCards.length >= this.getDrawCount(player).redraw && !this.selectedCards.includes(card)) {
            return false;
        }

        if(!this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
        } else {
            this.selectedCards = this.selectedCards.filter(selectedCard => selectedCard !== card);
        }
        player.setSelectedCards(this.selectedCards);
    }

    highlightSelectableCards(player) {
        player.selectCard = true;
        player.setSelectableCards(player.drawHand);
    }

    onMenuCommand(player, arg) {
        if(arg === 'draw') {
            let drawCount = this.getDrawCount(player);
            player.drawCardsToHand(drawCount.number, 'draw hand');
            this.getDrawCount(player).handDrawn = true;
            if(this.getDrawCount(player).redraw === 0) {
                this.getDrawCount(player).handRedrawn = true;
            } else {
                this.highlightSelectableCards(player);
            }
            return false;
        }
        if(arg === 'moreCards') {
            this.updateDrawCount(player, 1);
            return false;
        }
        if(arg === 'lessCards') {
            this.updateDrawCount(player, -1);
            return false;
        }
        if(arg === 'redraw') {
            let numberToRedraw = this.selectedCards.length;
            player.discardCards(this.selectedCards);
            player.drawCardsToHand(numberToRedraw, 'draw hand');
            this.getDrawCount(player).handRedrawn = true;
            this.selectedCards = [];
            player.clearSelectedCards();
            player.clearSelectableCards();
            return false;
        }
        if(arg === 'revealdraw') {
            if(player.drawHand.length !== 5) {
                player.drawHandSelected = false;
                return false;
            }
            player.drawHandSelected = true;   
            this.game.addMessage('{0} is ready to reveal their draw hand', player);
            return true;
        }
        return false;
    }
}

module.exports = DrawHandPrompt;
