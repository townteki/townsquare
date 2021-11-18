class PlayerPromptState {
    constructor() {
        this.selectCard = false;
        this.selectOrder = false;
        this.popupStayOpen = false;
        this.menuTitle = '';
        this.promptTitle = '';
        this.buttons = [];
        this.controls = [];
        this.promptInfo = {};

        this.selectableCards = [];
        this.selectedCards = [];
    }

    setSelectedCards(cards) {
        this.selectedCards = cards || [];
    }

    clearSelectedCards() {
        this.selectedCards = [];
    }

    setSelectableCards(cards) {
        this.selectableCards = cards || [];
    }

    clearSelectableCards() {
        this.selectableCards = [];
    }

    setPromptInfo(type, message) {
        this.promptInfo.type = type;
        this.promptInfo.message = message;
    }

    clearPromptInfo() {
        this.promptInfo = {};
    }    

    setPrompt(prompt) {
        this.selectCard = prompt.selectCard || false;
        this.selectOrder = prompt.selectOrder || false;
        this.popupStayOpen = prompt.popupStayOpen || false;
        this.menuTitle = prompt.menuTitle || '';
        this.promptTitle = prompt.promptTitle;
        this.promptInfo = prompt.promptInfo;
        this.buttons = (prompt.buttons || []).map(button => {
            if(button.card) {
                let card = button.card;
                let properties = Object.assign({}, button);
                delete properties['card'];
                return Object.assign({ text: card.title, arg: card.uuid, card: card.getShortSummary() }, properties);
            }

            return button;
        });
        this.controls = prompt.controls || [];
    }

    cancelPrompt() {
        this.selectCard = false;
        this.menuTitle = '';
        this.buttons = [];
        this.controls = [];
        this.clearPromptInfo();
    }

    getCardSelectionState(card) {
        let selectable = this.selectableCards.includes(card);
        let index = this.selectedCards.indexOf(card);
        let result = {
            // TODO M2 The `card.selected` property was used only for throneteki plot selection
            // Check if it can be removed.
            selected: card.selected || (index !== -1),
            selectable: selectable,
            unselectable: this.selectCard && !selectable
        };

        if(index !== -1 && this.selectOrder) {
            return Object.assign({ order: index + 1 }, result);
        }

        return result;
    }

    getState() {
        return {
            selectCard: this.selectCard,
            selectOrder: this.selectOrder,
            popupStayOpen: this.popupStayOpen,
            menuTitle: this.menuTitle,
            promptTitle: this.promptTitle,
            promptInfo: this.promptInfo,
            buttons: this.buttons.map(button => this.getButtonState(button)),
            controls: this.controls
        };
    }

    getButtonState(button) {
        if(button.disabled) {
            let disabled = typeof button.disabled === 'function' ? button.disabled() : button.disabled;
            return Object.assign({}, button, { disabled: !!disabled });
        }

        return button;
    }
}

module.exports = PlayerPromptState;
