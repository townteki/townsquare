const UiPrompt = require('./uiprompt');

class ChooseYesNoPrompt extends UiPrompt {
    constructor(game, player, properties) {
        super(game);
        this.player = player;
        this.title = properties.title;
        this.onYes = properties.onYes || (() => true);
        this.onNo = properties.onNo || (() => true);
    }

    activeCondition(player) {
        if (this.player === player) {
            return true;
        }
        return false;
    }

    activePrompt() {
        return {
            menuTitle: this.title,
            buttons: [
                { arg: 'yes', text: 'Yes' },
                { arg: 'no', text: 'No' }
            ]
        };
    }    

    onMenuCommand(player, arg) {
        if (arg === 'yes') {
            this.onYes();
        }
        if (arg === 'no') {
            this.onNo();
        }        
        this.complete();
        return true;
    }

}

module.exports = ChooseYesNoPrompt;
