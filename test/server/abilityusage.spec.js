const EventEmitter = require('events');

const AbilityUsage = require('../../server/game/abilityusage.js');

// TODO M2 add repeatable and shootout plays

describe('AbilityUsage', function () {
    beforeEach(function () {
        this.eventEmitterSpy = jasmine.createSpyObj('event emitter', ['on', 'removeListener']);
        this.usage = new AbilityUsage({});
    });

    describe('increment()', function() {
        it('should increase the use count', function() {
            this.usage = new AbilityUsage({});
            this.usage.increment();
            expect(this.usage.useCount).toBe(1);
        });
    });

    describe('isUsed', function() {
        beforeEach(function() {
            this.usage = new AbilityUsage({});
        });

        describe('when below the limit', function() {
            it('should return false', function() {
                expect(this.usage.isUsed()).toBe(false);
            });
        });

        describe('when at the limit', function() {
            beforeEach(function() {
                this.usage.increment();
            });

            it('should return false', function() {
                expect(this.usage.isUsed()).toBe(true);
            });
        });
    });

    describe('registerEvents()', function() {
        it('should register the event', function() {
            this.usage.registerEvents(this.eventEmitterSpy);
            expect(this.eventEmitterSpy.on).toHaveBeenCalledWith('onRoundEnded', jasmine.any(Function));
        });
    });

    describe('unregisterEvents()', function() {
        it('should remove the event', function() {
            this.usage.unregisterEvents(this.eventEmitterSpy);
            expect(this.eventEmitterSpy.removeListener).toHaveBeenCalledWith('onRoundEnded', jasmine.any(Function));
        });

        it('should reset the count to 0', function() {
            this.usage.increment();
            this.usage.unregisterEvents(this.eventEmitterSpy);
            expect(this.usage.useCount).toBe(0);
        });
    });

    describe('resetting the use count', function() {
        beforeEach(function() {
            this.eventEmitter = new EventEmitter();

            this.usage.registerEvents(this.eventEmitter);
            this.usage.increment();
        });

        afterEach(function() {
            this.usage.unregisterEvents(this.eventEmitter);
        });

        it('should set the use count to 0', function() {
            this.eventEmitter.emit('onRoundEnded');
            expect(this.usage.useCount).toBe(0);
        });
    });
});
