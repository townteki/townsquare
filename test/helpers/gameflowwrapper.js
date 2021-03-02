/* global jasmine */

const range = require('lodash.range');

const Game = require('../../server/game/game.js');
const PlayerInteractionWrapper = require('./playerinteractionwrapper.js');
const Settings = require('../../server/settings.js');

class GameFlowWrapper {
    constructor(options) {
        let gameRouter = jasmine.createSpyObj('gameRouter', ['gameWon', 'handleError', 'playerLeft']);
        gameRouter.handleError.and.callFake((game, error) => {
            throw error;
        });
        let details = {
            name: 'player1\'s game',
            id: 12345,
            owner: { username: 'player1' },
            saveGameId: 12345,
            players: this.generatePlayerDetails(options.numOfPlayers)
        };
        this.game = new Game(details, { router: gameRouter });
        this.game.started = true;

        this.allPlayers = this.game.getPlayers().map(player => new PlayerInteractionWrapper(this.game, player));
        this.playerToPlayerWrapperIndex = this.allPlayers.reduce((index, playerWrapper) => {
            index[playerWrapper.player] = playerWrapper;
            return index;
        }, {});
    }

    setFirstPlayer(firstPlayerName) {
        for(let playerWrapper of this.allPlayers) {
            playerWrapper.player.firstPlayer = playerWrapper.player.name === firstPlayerName;
        }
    }

    generatePlayerDetails(numOfPlayers) {
        return range(1, numOfPlayers + 1).map(i => {
            return { id: i.toString(), user: Settings.getUserWithDefaultsSet({ username: `player${i}` }) };
        });
    }

    eachPlayerInFirstPlayerOrder(handler) {
        let players = this.game.getPlayersInFirstPlayerOrder();
        let playersInOrder = players.map(player => this.playerToPlayerWrapperIndex[player]);

        for(let player of playersInOrder) {
            handler(player);
        }
    }

    eachPlayerInShootoutLoseWinOrder(handler) {
        this.guardCurrentPhase('shootout');
        let players = this.game.shootout.shootoutLoseWinOrder.map(playerName => this.game.getPlayerByName(playerName));
        let playersInOrder = players.map(player => this.playerToPlayerWrapperIndex[player]);

        for(let player of playersInOrder) {
            handler(player);
        }
    }

    startGame() {
        this.game.initialise();
    }

    keepStartingPosse() {
        for(let player of this.allPlayers) {
            player.clickPrompt('Done');
        }
    }

    drawStartingPosse() {
        for(let player of this.allPlayers) {
            player.drawCardsToHand(player.startingPosse);
        }
    }

    guardCurrentPhase(phase) {
        if(this.game.currentPhase !== phase) {
            throw new Error(`Expected to be in the ${phase} phase but actually was ${this.game.currentPhase}`);
        }
    }

    guardCurrentPlayWindow(playWindowName) {
        if(this.game.currentPlayWindow.name !== playWindowName) {
            throw new Error(`Expected to be in the ${playWindowName} play window but actually was ${this.game.currentPlayWindow.name}`);
        }
    }

    completeSetupPhase() {
        this.guardCurrentPhase('setup');
        this.keepStartingPosse();
    }

    completeHighNoonPhase() {
        this.guardCurrentPhase('high noon');
        this.eachPlayerInFirstPlayerOrder(player => player.clickPrompt('Pass'));
    }

    doneHighNoonPhase(player) {
        this.guardCurrentPhase('high noon');
        player.clickPrompt('Done');
    }

    completeGamblingPhase() {
        this.guardCurrentPhase('gambling');
        this.allPlayers.forEach(player => player.clickPrompt('Ready'));
        while(this.game.currentPlayWindow && this.game.currentPlayWindow.name === 'gambling') {
            this.playerToPlayerWrapperIndex[this.game.currentPlayWindow.currentPlayer].clickPrompt('Pass');
        }
    }

    completeUpkeepPhase() {
        this.guardCurrentPhase('upkeep');
        this.allPlayers.forEach(player => player.clickPrompt('Done'));
    }

    completeSundownPhase() {
        this.guardCurrentPhase('sundown');
        this.allPlayers.forEach(player => player.clickPrompt('Done'));
    }

    completeShootoutPlaysStep() {
        this.guardCurrentPhase('shootout');
        this.guardCurrentPlayWindow('shootout plays');
        this.eachPlayerInFirstPlayerOrder(player => {
            if(this.game.shootout) {
                player.clickPrompt('Pass');
            }
        });
    }

    doneShootoutPlaysStep(player) {
        this.guardCurrentPhase('shootout');
        this.guardCurrentPlayWindow('shootout plays');
        player.clickPrompt('Done');
    }

    completeShootoutDrawStep() {
        this.guardCurrentPhase('shootout');
        this.allPlayers.forEach(player => {
            player.prepareHand();
            player.clickPrompt('Ready');
        });
    }

    completeShootoutResolutionStep() {
        this.guardCurrentPhase('shootout');
        this.guardCurrentPlayWindow('shootout resolution');
        this.eachPlayerInFirstPlayerOrder(player => player.clickPrompt('Pass'));
    }

    doneShootoutResolutionStep(player) {
        this.guardCurrentPhase('shootout');
        this.guardCurrentPlayWindow('shootout resolution');
        player.clickPrompt('Done');
    }

    completeTakeYerLumpsStep() {
        this.guardCurrentPhase('shootout');
        this.eachPlayerInShootoutLoseWinOrder(player => {
            if(player.hasPromptButton('Ace')) {
                player.clickPrompt('Done');
            }
        });
    }

    removeFromPosse(card) {
        if(this.game.shootout) {
            this.game.shootout.removeFromPosse(card);
        }
    }

    skipToHighNoonPhase(skipSetup = true) {
        if(skipSetup) {
            this.completeSetupPhase();
        }
        this.completeGamblingPhase();
        this.setFirstPlayer('player1');
        this.completeUpkeepPhase();
    }

    getPromptedPlayer(title) {
        var promptedPlayer = this.allPlayers.find(p => p.hasPrompt(title));

        if(!promptedPlayer) {
            var promptString = this.allPlayers.map(player => player.name + ': ' + player.formatPrompt()).join('\n\n');
            throw new Error(`No players are being prompted with "${title}". Current prompts are:\n\n${promptString}`);
        }

        return promptedPlayer;
    }

    selectFirstPlayer(player) {
        var promptedPlayer = this.getPromptedPlayer('Select first player');
        promptedPlayer.clickPrompt(player.name);
    }
}

module.exports = GameFlowWrapper;
