const PlayingTypes = require('../../server/game/Constants/PlayingTypes.js');
const CostReducer = require('../../server/game/costreducer.js');

describe('CostReducer', function () {
    beforeEach(function () {
        this.gameSpy = jasmine.createSpyObj('game', ['on', 'removeListener']);
        this.source = {};
        this.usageSpy = jasmine.createSpyObj('usage', ['increment', 'isUsed', 'isRepeatable', 'registerEvents', 'unregisterEvents']);
        this.properties = {
            match: jasmine.createSpy('match')
        };
    });

    describe('constructor', function() {
        describe('defaults', function() {
            beforeEach(function() {
                this.reducer = new CostReducer(this.gameSpy, this.source, this.properties);
            });

            it('should default the amount to 1', function() {
                expect(this.reducer.amount).toBe(1);
            });

            it('should default to no users', function() {
                expect(this.reducer.uses).toBe(0);
            });
        });

        describe('when playingTypes is not an array', function() {
            beforeEach(function() {
                this.properties.playingTypes = PlayingTypes.Shoppin;
                this.reducer = new CostReducer(this.gameSpy, this.source, this.properties);
            });

            it('should wrap it in an array', function() {
                expect(this.reducer.playingTypes).toEqual([PlayingTypes.Shoppin]);
            });
        });
    });

    describe('canReduce()', function() {
        beforeEach(function() {
            this.card = {};
            this.properties.match.and.returnValue(true);
            this.properties.playingTypes = ['marshal', 'ambush'];
            this.usageSpy.isUsed.and.returnValue(false);
            this.reducer = new CostReducer(this.gameSpy, this.source, this.properties);
            this.reducer.usage = this.usageSpy;
        });

        describe('when not used, with correct play type, and the card matches', function() {
            it('should return true', function() {
                expect(this.reducer.canReduce('marshal', this.card)).toBe(true);
            });
        });

        describe('when used', function() {
            beforeEach(function() {
                this.usageSpy.isUsed.and.returnValue(true);
            });

            it('should return false', function() {
                expect(this.reducer.canReduce('marshal', this.card)).toBe(false);
            });
        });

        describe('when the play type does not match', function() {
            it('should return false', function() {
                expect(this.reducer.canReduce('foobar', this.card)).toBe(false);
            });
        });

        describe('when the card fails the match function', function() {
            beforeEach(function() {
                this.properties.match.and.returnValue(false);
            });

            it('should return false', function() {
                expect(this.reducer.canReduce('marshal', this.card)).toBe(false);
            });
        });
    });

    describe('markUsed()', function() {
        beforeEach(function() {
            this.reducer = new CostReducer(this.gameSpy, this.source, this.properties);
        });

        describe('when there is no usage', function() {
            beforeEach(function() {
                this.reducer.usage = null;
            });

            it('should not crash', function() {
                expect(() => this.reducer.markUsed()).not.toThrow();
            });
        });

        describe('when there is a usage', function() {
            beforeEach(function() {
                this.reducer.usage = this.usageSpy;
            });

            it('should increment the usage', function() {
                this.reducer.markUsed();
                expect(this.usageSpy.increment).toHaveBeenCalled();
            });
        });
    });

    describe('isExpired()', function() {
        beforeEach(function() {
            this.reducer = new CostReducer(this.gameSpy, this.source, this.properties);
        });

        describe('when there is no usage', function() {
            beforeEach(function() {
                this.reducer.usage = null;
            });

            it('should return false', function() {
                expect(this.reducer.isExpired()).toBe(false);
            });
        });

        describe('when there is a usage', function() {
            beforeEach(function() {
                this.reducer.usage = this.usageSpy;
            });

            describe('and the usage is not repeatable', function() {
                beforeEach(function() {
                    this.usageSpy.isRepeatable.and.returnValue(false);
                });

                it('should return false when not used', function() {
                    this.usageSpy.isUsed.and.returnValue(false);
                    expect(this.reducer.isExpired()).toBe(false);
                });

                it('should return true when used', function() {
                    this.usageSpy.isUsed.and.returnValue(true);
                    expect(this.reducer.isExpired()).toBe(true);
                });
            });

            describe('and the usage is repeatable', function() {
                beforeEach(function() {
                    this.usageSpy.isRepeatable.and.returnValue(true);
                });

                it('should return false when not used', function() {
                    this.usageSpy.isUsed.and.returnValue(false);
                    expect(this.reducer.isExpired()).toBe(false);
                });

                it('should return false even when used', function() {
                    this.usageSpy.isUsed.and.returnValue(true);
                    expect(this.reducer.isExpired()).toBe(false);
                });
            });
        });
    });

    describe('unregisterEvents()', function() {
        beforeEach(function() {
            this.reducer = new CostReducer(this.gameSpy, this.source, this.properties);
        });

        describe('when there is no usage', function() {
            beforeEach(function() {
                this.reducer.usage = null;
            });

            it('should not crash', function() {
                expect(() => this.reducer.unregisterEvents()).not.toThrow();
            });
        });

        describe('when there is a usage', function() {
            beforeEach(function() {
                this.reducer.usage = this.usageSpy;
            });

            it('should unregister events on the usage', function() {
                this.reducer.unregisterEvents();
                expect(this.usageSpy.unregisterEvents).toHaveBeenCalledWith(this.gameSpy);
            });
        });
    });
});
