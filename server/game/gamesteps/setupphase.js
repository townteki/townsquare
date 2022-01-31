const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const StartingPossePrompt = require('./setup/startingposseprompt.js');
const GrifterPrompt = require('./setup/grifterprompt.js');
const MathHelper = require('../MathHelper.js');

class SetupPhase extends Phase {
    constructor(game) {
        super(game, 'setup');
        this.initialise([
            new SimpleStep(game, () => this.announceOutfitAndLegend()),
            new SimpleStep(game, () => this.prepareDecks()),
            new SimpleStep(game, () => this.turnOnEffects()),
            new SimpleStep(game, () => this.drawStartingPosse()),
            new StartingPossePrompt(game),
            new SimpleStep(game, () => this.startGame()),
            new SimpleStep(game, () => this.announceSetupCards()),
            new SimpleStep(game, () => this.setInitialFirstPlayer()),
            new SimpleStep(game, () => game.raiseEvent('onSetupFinished')),
            new GrifterPrompt(game),
            new SimpleStep(game, () => game.activatePersistentEffects())
        ]);
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

            if(card.getType() === 'legend' || card.getType() === 'outfit') {
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
            this.queueStep(new SimpleStep(this.game, () => player.shuffleDrawDeck()));
            this.queueStep(new SimpleStep(this.game, () => this.game.raiseEvent('onSetupDrawDeckShuffled', { player: player })));
            this.queueStep(new SimpleStep(this.game, () => player.drawCardsToHand(player.handSize)));
        }
    }

    announceSetupCards() {
        for(const player of this.game.getPlayers()) {
            let cards = [...player.cardsInPlay];
            let dudes = cards.filter(card => card.getType() === 'dude');
            this.game.addMessage('{0} has following starting dudes: {1}', player, dudes);
        }
    }

    setInitialFirstPlayer() {
        let players = this.game.getPlayers();
        let firstPlayer = players[MathHelper.randomInt(players.length)];
        this.game.setFirstPlayer(firstPlayer);
        this.game.addMessage('{0} has been set randomly as a starting player', firstPlayer);
    }
}

module.exports = SetupPhase;
