const ChatCommands = require('../../../server/game/chatcommands.js');

describe('ChatCommands', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['addMessage', 'addAlert', 'raiseEvent']);

        this.playerSpy = jasmine.createSpyObj('player', ['drawCardsToHand', 'discardAtRandom', 'discardFromDrawDeck']);
        this.chatCommands = new ChatCommands(this.gameSpy);
    });

    describe('getNumberOrDefault()', function() {
        describe('with no arguments', function() {
            it('should return the default', function () {
                expect(this.chatCommands.getNumberOrDefault('', 1)).toBe(1);
            });
        });

        describe('with a string argument', function() {
            it('should return the default', function () {
                expect(this.chatCommands.getNumberOrDefault('test', 1)).toBe(1);
            });
        });

        describe('with a negative argument', function() {
            it('should return the default', function () {
                expect(this.chatCommands.getNumberOrDefault('-1', 1)).toBe(1);
            });
        });

        describe('with a valid argument', function() {
            it('should return the parsed value', function () {
                expect(this.chatCommands.getNumberOrDefault('3', 1)).toBe(3);
            });
        });
    });

    describe('executeCommand()', function() {
        describe('with a non-existent command', function() {
            it('should return false', function() {
                let result = this.chatCommands.executeCommand(this.playerSpy, '/foo', ['/foo', 'bar']);

                expect(result).toBe(false);
            });
        });

        describe('with a /draw command', function() {
            describe('with no arguments', function() {
                it('should draw 1 card', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/draw', ['/draw']);

                    expect(this.playerSpy.drawCardsToHand).toHaveBeenCalledWith(1);
                });
            });

            describe('with a string argument', function() {
                it('should draw 1 card', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/draw', ['/draw', 'test']);

                    expect(this.playerSpy.drawCardsToHand).toHaveBeenCalledWith(1);
                });
            });

            describe('with a negative argument', function() {
                it('should draw 1 card', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/draw', ['/draw', '-1']);

                    expect(this.playerSpy.drawCardsToHand).toHaveBeenCalledWith(1);
                });
            });

            describe('with a valid argument', function() {
                it('should draw the passed amount of cards', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/draw', ['/draw', '4']);

                    expect(this.playerSpy.drawCardsToHand).toHaveBeenCalledWith(4);
                });
            });
        });

        describe('with a /discard-random command', function() {
            describe('with no arguments', function() {
                it('should discard 1 card', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/discard-random', ['/discard-random']);

                    expect(this.playerSpy.discardAtRandom).toHaveBeenCalledWith(1);
                });
            });

            describe('with a string argument', function() {
                it('should discard 1 card', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/discard-random', ['/discard-random', 'test']);

                    expect(this.playerSpy.discardAtRandom).toHaveBeenCalledWith(1);
                });
            });

            describe('with a negative argument', function() {
                it('should discard 1 card', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/discard-random', ['/discard-random', '-1']);

                    expect(this.playerSpy.discardAtRandom).toHaveBeenCalledWith(1);
                });
            });

            describe('with a valid argument', function() {
                it('should discard the passed amount of cards', function () {
                    this.chatCommands.executeCommand(this.playerSpy, '/discard-random', ['/discard-random', '3']);

                    expect(this.playerSpy.discardAtRandom).toHaveBeenCalledWith(3);
                });
            });
        });
    });
});
