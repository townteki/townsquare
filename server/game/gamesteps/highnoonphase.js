//const _ = require('underscore');
const PhaseNames = require('../Constants/PhaseNames.js');
const Phase = require('./phase.js');
const PlayWindow = require('./playwindow.js');

class HighNoonPhase extends Phase {
    constructor(game) {
        super(game, PhaseNames.HighNoon);
        this.prompt = new PlayWindow(game, 'high noon', 'Actin\', Callin\' Out, Movin\', Shoppin\', or Tradin\'');
        this.initialise([
            this.prompt
        ]);
    }

    passToNextPlayer() {
        this.prompt.nextPlayer();
    }
}

module.exports = HighNoonPhase;
