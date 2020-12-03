//const _ = require('underscore');
const Phase = require('./phase.js');
const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');

class HighNoonPhase extends Phase {
    constructor(game) {
        super(game, 'high noon');
        this.prompt = new ContinuousPlayerOrderPrompt(game, 'Actin\', Callin\' Out, Movin\', Shoppin\', or Tradin\'');
        this.initialise([
            this.prompt
        ]);
    }

    passToNextPlayer() {
        this.prompt.nextPlayer();
    }

}

module.exports = HighNoonPhase;
