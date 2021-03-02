const CardTraitReaction = require('../../../server/game/cardtraitreaction.js');
const Event = require('../../../server/game/event.js');

describe('CardForcedReaction', function () {
    beforeEach(function () {
        this.gameSpy = jasmine.createSpyObj('game', ['on', 'popAbilityContext', 'pushAbilityContext', 'removeListener', 'registerAbility', 'resolveGameAction']);
        this.gameSpy.resolveGameAction.and.callFake(() => { 
            return { thenExecute: () => true };
        });
        this.cardSpy = jasmine.createSpyObj('card', ['getType', 'isAnyBlank', 'hasKeyword']);
        this.cardSpy.location = 'play area';
        this.usageSpy = jasmine.createSpyObj('usage', ['increment', 'isUsed', 'registerEvents', 'unregisterEvents']);

        this.properties = {
            when: {
                onSomething: jasmine.createSpy('when condition')
            },
            handler: jasmine.createSpy('handler')
        };

        this.properties.when.onSomething.and.returnValue(true);

        this.createReaction = () => {
            return new CardTraitReaction(this.gameSpy, this.cardSpy, this.properties);
        };
    });

    describe('eventHandler()', function() {
        beforeEach(function() {
            this.executeEventHandler = (args = {}) => {
                this.event = new Event('onSomething', args);
                this.reaction = new CardTraitReaction(this.gameSpy, this.cardSpy, this.properties);
                this.reaction.eventHandler(this.event);
            };
        });

        it('should call the when handler with the appropriate arguments', function() {
            this.executeEventHandler();
            expect(this.properties.when.onSomething).toHaveBeenCalledWith(this.event);
        });

        describe('when the when condition returns false', function() {
            beforeEach(function() {
                this.properties.when.onSomething.and.returnValue(false);
                this.executeEventHandler();
            });

            it('should not register the ability', function() {
                expect(this.gameSpy.registerAbility).not.toHaveBeenCalled();
            });
        });

        describe('when the when condition returns true', function() {
            beforeEach(function() {
                this.properties.when.onSomething.and.returnValue(true);
                this.executeEventHandler();
            });

            it('should register the ability', function() {
                expect(this.gameSpy.registerAbility).toHaveBeenCalledWith(this.reaction, this.event);
            });
        });
    });

    describe('meetsRequirements()', function() {
        beforeEach(function() {
            this.meetsRequirements = () => {
                this.event = new Event('onSomething', {});
                this.reaction = new CardTraitReaction(this.gameSpy, this.cardSpy, this.properties);
                this.reaction.usage = this.usageSpy;
                this.context = this.reaction.createContext(this.event);
                return this.reaction.meetsRequirements(this.context);
            };
        });

        it('should call the when handler with the appropriate arguments', function() {
            this.meetsRequirements();
            expect(this.properties.when.onSomething).toHaveBeenCalledWith(this.event);
        });

        describe('when in the setup phase', function() {
            beforeEach(function() {
                this.gameSpy.currentPhase = 'setup';
            });

            it('should return false', function() {
                expect(this.meetsRequirements()).toBe(false);
            });
        });

        describe('when the card has been blanked', function() {
            beforeEach(function() {
                this.cardSpy.isAnyBlank.and.returnValue(true);
            });

            it('should return false', function() {
                expect(this.meetsRequirements()).toBe(false);
            });
        });

        describe('when the when condition returns false', function() {
            beforeEach(function() {
                this.properties.when.onSomething.and.returnValue(false);
            });

            it('should return false', function() {
                expect(this.meetsRequirements()).toBe(false);
            });
        });

        describe('when the card is not in the proper location', function() {
            beforeEach(function() {
                this.cardSpy.location = 'foo';
            });

            it('should return false', function() {
                expect(this.meetsRequirements()).toBe(false);
            });
        });

        describe('test card trait reaction usage', function() {
            describe('when card trait reaction was used', function() {
                beforeEach(function() {
                    this.usageSpy.isUsed.and.returnValue(true);
                });

                it('should return false', function() {
                    expect(this.meetsRequirements()).toBe(false);
                });
            });

            describe('when card trait reaction was not used', function() {
                beforeEach(function() {
                    this.usageSpy.isUsed.and.returnValue(false);
                });

                it('should return true', function() {
                    expect(this.meetsRequirements()).toBe(true);
                });
            });
        });
    });

    describe('executeHandler', function() {
        beforeEach(function() {
            this.reaction = new CardTraitReaction(this.gameSpy, this.cardSpy, this.properties);
            this.context = { context: 1, game: this.gameSpy };
        });

        it('resolve the game action', function() {
            this.reaction.executeHandler(this.context);
            expect(this.gameSpy.resolveGameAction).toHaveBeenCalledWith(jasmine.any(Object), this.context);
        });
    });

    describe('registerEvents()', function() {
        beforeEach(function() {
            this.properties = {
                when: {
                    onFoo: () => true,
                    onBar: () => true
                },
                handler: () => true
            };
            this.reaction = this.createReaction();
            this.reaction.registerEvents();
        });

        it('should register all when event handlers with the proper event type suffix', function() {
            expect(this.gameSpy.on).toHaveBeenCalledWith('onFoo:traitreaction', jasmine.any(Function));
            expect(this.gameSpy.on).toHaveBeenCalledWith('onBar:traitreaction', jasmine.any(Function));
            // one more call for AbilityUsage registerEvents
            expect(this.gameSpy.on).toHaveBeenCalledWith('onRoundEnded', jasmine.any(Function));
        });

        it('should not reregister events already registered', function() {
            expect(this.gameSpy.on.calls.count()).toBe(3);
            this.reaction.registerEvents();
            expect(this.gameSpy.on.calls.count()).toBe(3);
        });
    });

    describe('unregisterEvents', function() {
        beforeEach(function() {
            this.properties = {
                when: {
                    onFoo: () => true,
                    onBar: () => true
                },
                handler: () => true
            };
            this.reaction = this.createReaction();
        });

        it('should unregister all previously registered when event handlers', function() {
            this.reaction.registerEvents();
            this.reaction.unregisterEvents();
            expect(this.gameSpy.removeListener).toHaveBeenCalledWith('onFoo:traitreaction', jasmine.any(Function));
            expect(this.gameSpy.removeListener).toHaveBeenCalledWith('onBar:traitreaction', jasmine.any(Function));
            // one more call for AbilityUsage registerEvents
            expect(this.gameSpy.on).toHaveBeenCalledWith('onRoundEnded', jasmine.any(Function));
        });

        it('should not remove listeners when they have not been registered', function() {
            this.reaction.unregisterEvents();
            expect(this.gameSpy.removeListener).not.toHaveBeenCalled();
        });

        it('should not unregister events already unregistered', function() {
            this.reaction.registerEvents();
            this.reaction.unregisterEvents();
            expect(this.gameSpy.removeListener.calls.count()).toBe(3);
            this.reaction.unregisterEvents();
            expect(this.gameSpy.removeListener.calls.count()).toBe(3);
        });
    });
});
