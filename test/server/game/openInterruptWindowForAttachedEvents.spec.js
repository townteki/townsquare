const Game = require('../../../server/game/game');

describe('Game', function() {
    beforeEach(function() {
        this.gameService = jasmine.createSpyObj('gameService', ['save']);
        this.game = new Game({ owner: {} }, { gameService: this.gameService });

        this.eventSpy = jasmine.createSpyObj('event', ['clearAttachedEvents', 'emitTo', 'getConcurrentEvents']);
        this.eventSpy.getConcurrentEvents.and.returnValue([this.eventSpy]);

        spyOn(this.game, 'queueStep');
    });

    describe('openWindowForAttachedEvents()', function() {
        describe('when the event has no attached events', function() {
            beforeEach(function() {
                this.eventSpy.attachedEvents = [];
                this.game.openReactionBeforeWindowForAttachedEvents(this.eventSpy);
            });

            it('should not open a reaction (before) window', function() {
                expect(this.game.queueStep).not.toHaveBeenCalled();
            });
        });

        describe('when the event has attached events', function() {
            beforeEach(function() {
                this.attachedEvent1 = { event: 1 };
                this.attachedEvent2 = { event: 1 };
                this.eventSpy.attachedEvents = [this.attachedEvent1, this.attachedEvent2];
                this.game.openReactionBeforeWindowForAttachedEvents(this.eventSpy);
            });

            it('should clear the attached events from the initial event', function() {
                expect(this.eventSpy.clearAttachedEvents).toHaveBeenCalled();
            });

            it('should open an reaction(before) window', function() {
                const ReactionBeforeWindow = require('../../../server/game/gamesteps/ReactionBeforeWindow');
                expect(this.game.queueStep).toHaveBeenCalledWith(jasmine.any(ReactionBeforeWindow));
            });

            it('should create an event grouping the attached events', function() {
                expect(this.game.queueStep).toHaveBeenCalledWith(jasmine.objectContaining({
                    event: jasmine.objectContaining({
                        childEvents: [
                            this.attachedEvent1,
                            this.attachedEvent2
                        ]
                    })
                }));
            });
        });
    });
});
