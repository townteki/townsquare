const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const UpkeepPrompt = require('./upkeep/upkeepprompt.js');

class UpkeepPhase extends Phase {
    constructor(game) {
        super(game, 'upkeep');
        this.initialise([
            new SimpleStep(game, () => this.receiveProduction()),
            new UpkeepPrompt(game)
        ]);
    }

    receiveProduction() {
        _.each(this.game.getPlayers(), player => {
            let production = player.receiveProduction();
            this.game.addMessage('{0} has received production of {1} GR', player, production);
        });
    }

    /*
    prepareDecks() {
        this.game.raiseEvent('onDecksPrepared');
        _.each(this.game.getPlayers(), player => {
            if(player.agenda) {
                player.agenda.applyPersistentEffects();
            }
        });
        this.game.allCards.each(card => {
            card.applyAnyLocationPersistentEffects();
        });
    }

    drawStartingPosse() {
        _.each(this.game.getPlayers(), player => {
            player.drawCardsToHand('hand', player.startingPosse);
        });
    }

    startGame() {
        _.each(this.game.getPlayers(), player => {
            player.startGame();
        });
    }

    setupDone() {
        _.each(this.game.getPlayers(), p => {
            p.setupDone();
        });
    }*/
}

module.exports = UpkeepPhase;
