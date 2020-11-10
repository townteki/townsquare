const MenuPrompt = require('./menuprompt.js');

class DeedStreetSidePrompt extends MenuPrompt {
    constructor(game, player, deedCard, playingType) {
        super(game, player, deedCard, playingType);
        this.player = player;
        this.deedCard = deedCard;
        this.playingType = playingType;
    }

    continue() {
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
