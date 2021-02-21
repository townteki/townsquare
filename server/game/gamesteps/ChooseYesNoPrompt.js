const UiPrompt = require('./uiprompt');

class ChooseYesNoPrompt extends UiPrompt {
    constructor(game, player, properties) {
        super(game);
        this.player = player;
        this.source = properties.source;
        this.title = properties.title;
        this.onYes = properties.onYes || (() => true);
        this.onNo = properties.onNo || (() => true);
    }

    activeCondition(player) {
        if(this.player === player) {
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
            ],
            promptTitle: this.source ? this.source.title : undefined
        };
    }    

    onMenuCommand(player, arg) {
        if(arg === 'yes') {
            this.onYes(player);
        }
        if(arg === 'no') {
            this.onNo(player);
        }        
        this.complete();
        return true;
    }
}

module.exports = ChooseYesNoPrompt;
