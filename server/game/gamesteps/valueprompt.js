const UiPrompt = require('./uiprompt.js');

class ValuePrompt extends UiPrompt {
    constructor(game, player, title, method, context, source, condition = () => true) {
        super(game);
        this.player = player;
        this.title = title;
        this.method = method;
        this.context = context;
        this.condition = condition;
        this.currentValue = 8;
        this.valueIsSet = false;
    }

    activeCondition(player) {
        if(this.player === this.game.automaton) {
            return player === this.player.getOpponent() && !this.valueIsSet;
        }        
        return player === this.player && !this.valueIsSet;
    }

    activePrompt(player) {
        if(this.player === this.game.automaton) {
            player = this.player;
        }        
        return {
            menuTitle: this.title,
            buttons: this.getButtons(player)
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to select value' };
    }

    isComplete() {
        return this.valueIsSet;
    }

    getButtons(player) {
        const currentValueButton = {
            text: this.getValueText(),
            arg: 'returnValue',
            disabled: !this.condition(player, this.currentValue)
        };
        const minButton = {
            text: '',
            arg: 'setMin',
            disabled: this.currentValue === 1,
            menuIcon: 'fast-backward'
        };
        const maxButton = {
            text: '',
            arg: 'setMax',
            disabled: this.currentValue === 13,
            menuIcon: 'fast-forward'
        };
        const lessButton = {
            text: '',
            arg: 'setLess',
            disabled: this.currentValue === 1,
            menuIcon: 'step-backward'
        };
        const moreButton = {
            text: '',
            arg: 'setMore',
            disabled: this.currentValue === 13,
            menuIcon: 'step-forward'
        };
        return [minButton, lessButton, currentValueButton, moreButton, maxButton];
    }

    onMenuCommand(player, arg) {
        if(this.player === this.game.automaton) {
            player = this.player;
        }        
        if(player !== this.player) {
            return false;
        }
        
        switch(arg) {
            case 'returnValue':
                this.valueIsSet = true;
                this.context[this.method](this.player, this.currentValue);
                return false;
            case 'setMax':
                this.currentValue = 13;
                return false;
            case 'setMin':
                this.currentValue = 1;
                return false;
            case 'setLess':
                this.currentValue -= 1;
                return false;
            case 'setMore':
                this.currentValue += 1;
                return false;
            default:
                break;
        }
        return false;
    }

    getValueText() {
        switch(this.currentValue) {
            case 1:
                return 'A';
            case 11:
                return 'J';
            case 12:
                return 'Q';
            case 13:
                return 'K';  
            default:
                return this.currentValue;
        }
    }
}

module.exports = ValuePrompt;
