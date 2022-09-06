const MenuPrompt = require('./menuprompt.js');

class DeedStreetSidePrompt extends MenuPrompt {
    constructor(game, player, deedCard, playingType) {
        super(game, player, deedCard, playingType);
        this.player = player;
        this.deedCard = deedCard;
        this.playingType = playingType;
    }

    continue() {
        if(this.player === this.game.automaton) {
            let leftNum = 0 - this.player.leftmostLocation().order;
            let rightNum = this.player.rightmostLocation().order;
            if(rightNum < leftNum) {
                this.rightSide();
            } else {
                this.leftSide();
            }
        } else {
            let leftButton = { text: 'Left', method: 'leftSide', arg: ''};
            let rightButton = { text: 'Right', method: 'rightSide', arg: ''};
        
            this.game.promptWithMenu(this.player, this, {
                activePrompt: {
                    menuTitle: 'Place ' + this.context.title + ' on Left/Right?',
                    buttons: [leftButton, rightButton]
                },
                source: this.context
            });
        }
    }

    leftSide() {
        this.player.addDeedToLeft(this.context);
        return true;
    }

    rightSide() {
        this.player.addDeedToRight(this.context);
        return true;
    }
}

module.exports = DeedStreetSidePrompt;
