const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const StartingPossePrompt = require('./setup/startingposseprompt.js');

class SetupPhase extends Phase {
    constructor(game) {
        super(game, 'setup');
        this.initialise([
            new SimpleStep(game, () => this.announceOutfitAndLegend()),
            new SimpleStep(game, () => this.prepareDecks()),
            new SimpleStep(game, () => this.turnOnEffects()),
            new SimpleStep(game, () => this.drawStartingPosse()),
            // TODO M2 Shootout testing - uncomment next line and comment out StartingPossePrompt
            //new SimpleStep(game, () => this.startPosses()),
            new StartingPossePrompt(game),
            new SimpleStep(game, () => this.startGame()),
            new SimpleStep(game, () => this.announceSetupCards()),
            new SimpleStep(game, () => game.raiseEvent('onSetupFinished')),
            new SimpleStep(game, () => game.activatePersistentEffects())
        ]);
    }

    // TODO M2 Shootout testing
    startPosses() {
        for(const player of this.game.getPlayers()) {
            player.startPosse();
        }
    }    

    announceOutfitAndLegend() {
        for(const player of this.game.getPlayers()) {
            this.game.addMessage('{0} announces they are playing with {1} with {2}', player, player.outfit, player.legend || 'no legend');
        }
    }

    prepareDecks() {
        this.game.gatherAllCards();
        this.game.raiseEvent('onDecksPrepared');
    }

    turnOnEffects() {
        for(const card of this.game.allCards) {
            card.applyAnyLocationPersistentEffects();

            if(card.getType() === 'legend') {
                card.applyPersistentEffects();
            }
        }
    }

    drawStartingPosse() {
        for(const player of this.game.getPlayers()) {
            player.drawCardsToHand(player.startingPosse);
        }
    }

    startGame() {
        for(const player of this.game.getPlayers()) {
            player.readyToStart = true;
            player.startGame();
        }
    }

    announceSetupCards() {
        for(const player of this.game.getPlayers()) {
            let cards = [...player.cardsInPlay];
            let dudes = cards.filter(card => card.getType() === 'dude');
            this.game.addMessage('{0} has following starting dudes: {1}.', player, dudes);
        }
    }
}

module.exports = SetupPhase;
