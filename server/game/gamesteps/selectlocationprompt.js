const SelectCardPrompt = require('./selectcardprompt.js');

/**
 * General purpose prompt that asks the user to select a location (also townsquare).
 *
 * The properties option object has the following properties:
 * additionalButtons  - array of additional buttons for the prompt.
 * additionalControls - array of additional controls for the prompt.
 * activePromptTitle  - the title that should be used in the prompt for the
 *                      choosing player.
 * waitingPromptTitle - the title that should be used in the prompt for the
 *                      opponent players.
 * maxStat            - a function that returns the maximum value that cards
 *                      selected by the prompt cannot exceed. If not specified,
 *                      then no stat limiting is done on the prompt.
 * cardStat           - a function that takes a card and returns a stat value.
 *                      Used for prompts that have a maximum stat value.
 * cardCondition      - a function that takes a card and should return a boolean
 *                      on whether that card is elligible to be selected.
 * onSelect           - a callback that is called once all cards have been
 *                      selected. On single card prompts this is called as soon
 *                      as an elligible card is clicked. On multi-select prompts
 *                      it is called when the done button is clicked. If the
 *                      callback does not return true, the prompt is not marked
 *                      as complete.
 * onMenuCommand      - a callback that is called when one of the additional
 *                      buttons is clicked.
 * onCancel           - a callback that is called when the player clicks the
 *                      done button without selecting any cards.
 * source             - what is at the origin of the user prompt, usually a card;
 *                      used to provide a default waitingPromptTitle, if missing
 */
class SelectLocationPrompt extends SelectCardPrompt {
    constructor(game, choosingPlayer, properties) {
        super(game, choosingPlayer, properties);
        this.properties.additionalButtons.push({ text: 'Town Square', arg: 'townsquare' });
        this.activePromptTitle = this.properties.activePromptTitle || 'Select target location for movement';
    }

    defaultProperties() {
        let cardPrompt = super.defaultProperties();
        return Object.assign({ 
            cardType: ['location'],
            numCards: 1,
            autoSelect: true
        }, cardPrompt);
    }

    onMenuCommand(player, arg) {
        if(player !== this.choosingPlayer) {
            return false;
        }

        if(arg === 'townsquare') {
            this.selectedCards.push(this.game.townsquare.locationCard);
            this.fireOnSelect();
            return;
        }

        super.onMenuCommand(player, arg);
    }
}

module.exports = SelectLocationPrompt;
