const PlayWindow = require('../../../server/game/gamesteps/playwindow.js');
const Game = require('../../../server/game/game.js');
const Player = require('../../../server/game/player.js');
const Settings = require('../../../server/settings.js');

describe('PlayWindow', function() {
    beforeEach(function() {
        this.gameService = jasmine.createSpyObj('gameService', ['save']);
        this.game = new Game({ owner: {} }, { gameService: this.gameService });
        this.player1 = new Player('1', Settings.getUserWithDefaultsSet({ username: 'Player 1' }), true, this.game);
        this.player2 = new Player('2', Settings.getUserWithDefaultsSet({ username: 'Player 2' }), false, this.game);
        this.player2.firstPlayer = true;
        this.game.playersAndSpectators[this.player1.name] = this.player1;
        this.game.playersAndSpectators[this.player2.name] = this.player2;

        this.prompt = new PlayWindow(this.game, 'Test Window', 'test');
    });

    it('should prompt in first player order', function() {
        expect(this.prompt.currentPlayer).toBe(this.player2);
    });

    describe('onDone()', function() {
        describe('when it is the current player', function() {
            beforeEach(function() {
                this.prompt.onDone(this.player2);
            });

            it('should make the next player be the current player', function() {
                expect(this.prompt.currentPlayer).toBe(this.player1);
            });
        });

        describe('when it is not the current player', function() {
            beforeEach(function() {
                this.prompt.onDone(this.player1);
            });

            it('should not change the current player', function() {
                expect(this.prompt.currentPlayer).toBe(this.player2);
            });
        });
    });

    describe('onPass()', function() {
        describe('when it is the current player', function() {
            beforeEach(function() {
                this.prompt.onPass(this.player2);
            });

            it('should make the next player be the current player', function() {
                expect(this.prompt.currentPlayer).toBe(this.player1);
            });
        });

        describe('when next player does not pass', function() {
            beforeEach(function() {
                this.prompt.onPass(this.player2);
                this.prompt.onDone(this.player1);
            });

            it('should change back to the next player', function() {
                expect(this.prompt.currentPlayer).toBe(this.player2);
            });
        });

        describe('when both players pass', function() {
            beforeEach(function() {
                this.prompt.onPass(this.player2);
                this.prompt.onPass(this.player1);
            });

            it('should complete the play window', function() {
                expect(this.prompt.isComplete()).toBe(true);
            });
        });
    });

    describe('markActionAsTaken()', function() {
        describe('when a player takes an action', function() {
            beforeEach(function() {
                // Complete the window for player 2
                this.prompt.onPass(this.player2);

                // Player 1 takes an action
                this.prompt.markActionAsTaken(this.player1);
            });

            it('should rotate the current player', function() {
                expect(this.prompt.currentPlayer).toBe(this.player2);
            });

            it('should re-prompt other players once the current player is done', function() {
                this.prompt.onDone(this.player2);
                expect(this.prompt.currentPlayer).toBe(this.player1);
                expect(this.prompt.isComplete()).toBe(false);
            });
        });

        describe('when someone other than the current player takes an action', function() {
            beforeEach(function() {
                // Player 2 is first player, so player 1 takes their action out
                // of turn.
                this.prompt.markActionAsTaken(this.player1);
            });

            it('should rotate the current player', function() {
                // Since player 1 took their action out of turn, player 2 should
                // be prompted again for their action.
                expect(this.prompt.currentPlayer).toBe(this.player2);
            });
        });
    });

    describe('continue()', function() {
        describe('when not all players passed', function() {
            beforeEach(function() {
                this.prompt.onPass(this.player2);
            });

            it('should return false', function() {
                expect(this.prompt.continue()).toBe(false);
            });
        });

        describe('when not all players are done', function() {
            beforeEach(function() {
                this.prompt.onDone(this.player2);
            });

            it('should return false', function() {
                expect(this.prompt.continue()).toBe(false);
            });
        });

        describe('when all players passed', function() {
            beforeEach(function() {
                this.prompt.onPass(this.player2);
                this.prompt.onPass(this.player1);
            });

            it('should return true', function() {
                expect(this.prompt.continue()).toBe(true);
            });
        });

        // TODO M2 check also playWindowOpened and events for opening and closing play windows
    });
});
