const PhaseNames = require('../Constants/PhaseNames.js');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const UpkeepPrompt = require('./upkeep/upkeepprompt.js');

class UpkeepPhase extends Phase {
    constructor(game) {
        super(game, PhaseNames.Upkeep);
        this.initialise([
            new SimpleStep(game, () => this.receiveProduction()),
            new SimpleStep(game, () => game.raiseEvent('onProductionReceived')),
            new UpkeepPrompt(game)
        ]);
    }

    receiveProduction() {
        this.game.getPlayers().forEach(player => {
            let production = player.receiveProduction();
            let debtorText = '';
            if(player.debtor) {
                production--;
                player.debtor = false;
                debtorText = '(-1 borrowed GR)';
            }
            this.game.addMessage('{0} has received production of {1} GR{2}', player, production, debtorText);
        });
    }
}

module.exports = UpkeepPhase;
