const Game = require('../../../server/game/game.js');
const Player = require('../../../server/game/player.js');

describe('Game', function() {
    beforeEach(function() {
        this.gameService = jasmine.createSpyObj('gameService', ['save']);
        this.game = new Game({ owner: {} }, 'Test Game', { gameService: this.gameService });

        this.player1 = new Player('1', { username: 'Player 1', settings: {} }, true, this.game);
        this.player2 = new Player('2', { username: 'Player 2', settings: {} }, false, this.game);
        this.player1.getHandRank = jasmine.createSpy('getHandRank');
        this.player2.getHandRank = jasmine.createSpy('getHandRank');
    });

    describe('resolveTiebreaker()', function() {
        describe('when both players have same rank modifiers (sign)', function() {
            it('should be exact tie if both rank modifiers are negative', function() {
                this.player1.rankModifier = -1;
                this.player2.rankModifier = -1;
                var result = this.game.resolveTiebreaker(this.player1, this.player2);
                expect(result).toEqual({ decision: 'exact tie' });
            });

            it('should be exact tie if both rank modifiers are positive', function() {
                this.player1.rankModifier = 1;
                this.player2.rankModifier = 1;
                var result = this.game.resolveTiebreaker(this.player1, this.player2);
                expect(result).toEqual({ decision: 'exact tie' });
            });
        });

        describe('when there is no tiebreaker for player1', function() {
            it('should be exact tie', function() {
                this.player1.getHandRank.and.callFake(function() { 
                    return { tiebreaker: undefined };
                });
                this.player2.getHandRank.and.callFake(function() { 
                    return { tiebreaker: [2, 3] };
                });
                var result = this.game.resolveTiebreaker(this.player1, this.player2);
                expect(result).toEqual({ decision: 'exact tie' });
            });
        });

        describe('when there is no tiebreaker for player2', function() {
            it('should be exact tie', function() {
                this.player1.getHandRank.and.callFake(function() { 
                    return { tiebreaker: [2, 3] };
                });
                this.player2.getHandRank.and.callFake(function() { 
                    return { tiebreaker: undefined };
                });
                var result = this.game.resolveTiebreaker(this.player1, this.player2);
                expect(result).toEqual({ decision: 'exact tie' });
            });
        });

        describe('when both hands are exactly the same', function() {
            it('should be exact tie', function() {
                this.player1.getHandRank.and.callFake(function() { 
                    return { 
                        tiebreaker: [2, 3],
                        tiebreakerHighCards: [4]
                    };
                });
                this.player2.getHandRank.and.callFake(function() { 
                    return { 
                        tiebreaker: [2, 3],
                        tiebreakerHighCards: [4]
                    };
                });
                var result = this.game.resolveTiebreaker(this.player1, this.player2);
                expect(result).toEqual({ decision: 'exact tie' });
            });
        });

        describe('when determining lowball hands', function() {
            describe('if player1 does not have rank modifier', function() {
                beforeEach(function() {
                    this.player1.rankModifier = 0;
                });
                describe('if player2\'s rank modifier is positive', function() {
                    it('player2 should be the winner', function() {
                        this.player2.rankModifier = 1;
                        var result = this.game.resolveTiebreaker(this.player1, this.player2, true);
                        expect(result).toEqual({ 
                            winner: this.player2, 
                            loser: this.player1, 
                            decision: 'rank modifier' 
                        });
                    });
                });
                describe('if player2\'s rank modifier is negative', function() {
                    it('player1 should be the winner', function() {
                        this.player2.rankModifier = -1;
                        var result = this.game.resolveTiebreaker(this.player1, this.player2, true);
                        expect(result).toEqual({ 
                            winner: this.player1,
                            loser: this.player2,
                            decision: 'rank modifier' 
                        });
                    });
                });
            });
            describe('if both player1 and player2 have rank modifier', function() {
                describe('if player2\'s rank modifier is positive', function() {
                    it('player2 should be the winner', function() {
                        this.player1.rankModifier = -1;
                        this.player2.rankModifier = 1;
                        var result = this.game.resolveTiebreaker(this.player1, this.player2, true);
                        expect(result).toEqual({ 
                            winner: this.player2, 
                            loser: this.player1, 
                            decision: 'rank modifier' 
                        });
                    });
                });
            });
            describe('if determining based on tiebreakers', function() {
                beforeEach(function() {
                    this.player1.getHandRank.and.callFake(function() { 
                        return { tiebreaker: [2, 4] };
                    });
                });
                describe('if player2\'s tiebreaker is lower', function() {
                    it('player2 should be the winner', function() {
                        this.player2.getHandRank.and.callFake(function() { 
                            return { tiebreaker: [2, 3] };
                        });
                        var result = this.game.resolveTiebreaker(this.player1, this.player2, true);
                        expect(result).toEqual({ 
                            winner: this.player2, 
                            loser: this.player1, 
                            decision: 'tiebreaker' 
                        });
                    });
                });
            });
            describe('if determining based on high cards', function() {
                beforeEach(function() {
                    this.player1.getHandRank.and.callFake(function() { 
                        return { 
                            tiebreaker: [],
                            tiebreakerHighCards: [1, 5, 11]
                        };
                    });
                });
                describe('if player2\'s tiebreakerHighCards is lower', function() {
                    it('player2 should be the winner', function() {
                        this.player2.getHandRank.and.callFake(function() { 
                            return { 
                                tiebreaker: [],
                                tiebreakerHighCards: [1, 4, 12]
                            };
                        });
                        var result = this.game.resolveTiebreaker(this.player1, this.player2, true);
                        expect(result).toEqual({ 
                            winner: this.player2, 
                            loser: this.player1, 
                            decision: 'tiebreaker' 
                        });
                    });
                });
            });
            describe('if determining based on tiebreaker and high cards', function() {
                beforeEach(function() {
                    this.player1.getHandRank.and.callFake(function() { 
                        return { 
                            tiebreaker: [2, 4],
                            tiebreakerHighCards: [5]
                        };
                    });
                });
                describe('if player2\'s tiebreakerHighCards is lower', function() {
                    it('player2 should be the winner', function() {
                        this.player2.getHandRank.and.callFake(function() { 
                            return { 
                                tiebreaker: [2, 4],
                                tiebreakerHighCards: [3]
                            };
                        });
                        var result = this.game.resolveTiebreaker(this.player1, this.player2, true);
                        expect(result).toEqual({ 
                            winner: this.player2, 
                            loser: this.player1, 
                            decision: 'tiebreaker' 
                        });
                    });
                });
            });
        });
    });
    describe('when determining shootout hands', function() {
        describe('if player1 does not have rank modifier', function() {
            beforeEach(function() {
                this.player1.rankModifier = 0;
            });
            describe('if player2\'s rank modifier is positive', function() {
                it('player1 should be the winner', function() {
                    this.player2.rankModifier = 1;
                    var result = this.game.resolveTiebreaker(this.player1, this.player2);
                    expect(result).toEqual({ 
                        winner: this.player1, 
                        loser: this.player2, 
                        decision: 'rank modifier' 
                    });
                });
            });
            describe('if player2\'s rank modifier is negative', function() {
                it('player1 should be the winner', function() {
                    this.player2.rankModifier = -1;
                    var result = this.game.resolveTiebreaker(this.player1, this.player2);
                    expect(result).toEqual({ 
                        winner: this.player2,
                        loser: this.player1,
                        decision: 'rank modifier' 
                    });
                });
            });
        });
        describe('if both player1 and player2 have rank modifier', function() {
            describe('if player2\'s rank modifier is positive', function() {
                it('player1 should be the winner', function() {
                    this.player1.rankModifier = -1;
                    this.player2.rankModifier = 1;
                    var result = this.game.resolveTiebreaker(this.player1, this.player2);
                    expect(result).toEqual({ 
                        winner: this.player1, 
                        loser: this.player2, 
                        decision: 'rank modifier' 
                    });
                });
            });
        });
    });
});
