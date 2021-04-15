const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const UpkeepPrompt = require('./upkeep/upkeepprompt.js');

class UpkeepPhase extends Phase {
    constructor(game) {
        super(game, 'upkeep');
        this.initialise([
            new SimpleStep(game, () => this.receiveProduction()),
            // TODO M2 Shootout testing - comment out UpkeepPrompt
            new UpkeepPrompt(game)
        ]);
    }

    receiveProduction() {
        this.game.getPlayers().forEach(player => {
            let production = player.receiveProduction();
            this.game.addMessage('{0} has received production of {1} GR', player, production);
        });
    }
}

module.exports = UpkeepPhase;
