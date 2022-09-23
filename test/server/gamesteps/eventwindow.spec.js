const EventWindow = require('../../../server/game/gamesteps/eventwindow.js');

describe('EventWindow', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['openAbilityWindow', 'openReactionBeforeWindowForAttachedEvents']);
        this.gameSpy.beforeEventHandlers = {};
        this.eventSpy = jasmine.createSpyObj('event', ['cancel', 'clearAttachedEvents', 'emitTo', 'executeHandler', 'executePostHandler', 'getConcurrentEvents']);
        this.eventSpy.attachedEvents = [];
        this.eventSpy.getConcurrentEvents.and.returnValue([]);
        this.eventWindow = new EventWindow(this.gameSpy, this.eventSpy);
    });

    describe('continue()', function() {
        describe('during the normal flow', function() {
            beforeEach(function() {
                this.eventWindow.continue();
            });

            it('should emit all of the reaction events', function() {
                expect(this.gameSpy.openAbilityWindow).toHaveBeenCalledWith({ abilityType: 'traitbeforereaction', event: this.eventSpy });
                expect(this.gameSpy.openAbilityWindow).toHaveBeenCalledWith({ abilityType: 'beforereaction', event: this.eventSpy });
                expect(this.eventSpy.emitTo).toHaveBeenCalledWith(this.gameSpy);
                expect(this.gameSpy.openAbilityWindow).toHaveBeenCalledWith({ abilityType: 'traitreaction', event: this.eventSpy });
                expect(this.gameSpy.openAbilityWindow).toHaveBeenCalledWith({ abilityType: 'reaction', event: this.eventSpy });
            });

            it('should call the handler', function() {
                expect(this.eventSpy.executeHandler).toHaveBeenCalled();
            });
        });

        describe('when the event is cancelled', function() {
            beforeEach(function() {
                this.eventSpy.cancelled = true;
            });

            it('should not emit the post-cancel reaction events', function() {
                this.eventWindow.continue();
                expect(this.gameSpy.openAbilityWindow).not.toHaveBeenCalledWith({ abilityType: 'traitbeforereaction', event: this.eventSpy });
                expect(this.gameSpy.openAbilityWindow).not.toHaveBeenCalledWith({ abilityType: 'beforereaction', event: this.eventSpy });
                expect(this.eventSpy.emitTo).not.toHaveBeenCalled();
                expect(this.gameSpy.openAbilityWindow).not.toHaveBeenCalledWith({ abilityType: 'traitreaction', event: this.eventSpy });
                expect(this.gameSpy.openAbilityWindow).not.toHaveBeenCalledWith({ abilityType: 'reaction', event: this.eventSpy });
            });

            it('should not call the handler', function() {
                this.eventWindow.continue();
                expect(this.eventSpy.executeHandler).not.toHaveBeenCalled();
            });

            describe('and another step has been queued on the event', function() {
                beforeEach(function() {
                    this.anotherStep = jasmine.createSpyObj('step', ['continue']);
                    this.eventWindow.queueStep(this.anotherStep);
                });

                it('should still call the step', function() {
                    this.eventWindow.continue();
                    expect(this.anotherStep.continue).toHaveBeenCalled();
                });
            });
        });

        describe('when an event handler cancels the event', function() {
            beforeEach(function() {
                this.eventSpy.executeHandler.and.callFake(() => {
                    this.eventSpy.cancelled = true;
                });
                this.eventWindow.continue();
            });

            it('should emit all of the reactions(before) events', function() {
                expect(this.gameSpy.openAbilityWindow).toHaveBeenCalledWith({ abilityType: 'traitbeforereaction', event: this.eventSpy });
                expect(this.gameSpy.openAbilityWindow).toHaveBeenCalledWith({ abilityType: 'beforereaction', event: this.eventSpy });
            });

            it('should not emit the post-cancel  events', function() {
                expect(this.eventSpy.emitTo).not.toHaveBeenCalled();
                expect(this.gameSpy.openAbilityWindow).not.toHaveBeenCalledWith({ abilityType: 'forcedreaction', event: this.eventSpy });
                expect(this.gameSpy.openAbilityWindow).not.toHaveBeenCalledWith({ abilityType: 'reaction', event: this.eventSpy });
            });
        });
    });
});
