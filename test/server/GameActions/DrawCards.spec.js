const DrawCards = require('../../../server/game/GameActions/DrawCards');

describe('DrawCards', function() {
    beforeEach(function() {
        this.playerSpy = jasmine.createSpyObj('player', ['getNumCardsToDraw', 'placeCardInPile', 'shuffleDiscardToDrawDeck', 'drawDeckAction']);
        this.playerSpy.getNumCardsToDraw.and.returnValue(2);
        this.playerSpy.drawDeck = ['card1', 'card2'];
        this.playerSpy.discardPile = [];
        this.playerSpy.drawnCards = 0;
        this.props = { player: this.playerSpy, amount: 2 };
    });

    describe('allow()', function() {
        describe('when the player can draw cards', function() {
            beforeEach(function() {
                this.playerSpy.getNumCardsToDraw.and.returnValue(1);
            });

            it('returns true', function() {
                expect(DrawCards.allow(this.props)).toBe(true);
            });
        });

        describe('when the player cannot draw cards', function() {
            beforeEach(function() {
                this.playerSpy.getNumCardsToDraw.and.returnValue(0);
            });

            it('returns false', function() {
                expect(DrawCards.allow(this.props)).toBe(false);
            });
        });
    });

    describe('createEvent()', function() {
        beforeEach(function() {
            this.event = DrawCards.createEvent(this.props);
        });

        describe('draw amount of cards available in draw deck', function() {
            it('creates a onCardsDrawn event', function() {
                expect(this.event.name).toBe('onCardsDrawn');
                expect(this.event.player).toBe(this.playerSpy);
                // Default the reason to "ability"
                expect(this.event.reason).toBe('ability');
                // Do not set the card list until the draw actually resolves
                expect(this.event.cards).toEqual([]);
                // Amount should be the actual amount drawn, not the amount passed in
                expect(this.event.amount).toBe(2);
            });

            it('passes through reason and source', function() {
                this.props.reason = 'reason';
                this.props.source = 'source';
                this.event = DrawCards.createEvent(this.props);

                expect(this.event.reason).toBe('reason');
                expect(this.event.source).toBe('source');
            });
        });

        describe('draw amount of cards available in draw deck', function() {
            beforeEach(function() {
                this.playerSpy.getNumCardsToDraw.and.returnValue(1);
                this.playerSpy.shuffleDiscardToDrawDeck.and.callFake(function() {
                    this.drawDeck = ['card2'];
                });
                this.playerSpy.drawDeck = ['card1'];
                this.playerSpy.discardPile = ['card2'];
                this.props = { player: this.playerSpy, amount: 2 };
                this.event = DrawCards.createEvent(this.props);
            });

            it('creates a onCardsDrawn event', function() {
                expect(this.event.name).toBe('onCardsDrawn');
                expect(this.event.player).toBe(this.playerSpy);
                // Default the reason to "ability"
                expect(this.event.reason).toBe('ability');
                // Do not set the card list until the draw actually resolves
                expect(this.event.cards).toEqual([]);
                // Amount should be the actual amount drawn, not the amount passed in
                expect(this.event.amount).toBe(2);
            });
       
            it('passes through reason and source', function() {
                this.props.reason = 'reason';
                this.props.source = 'source';
                this.event = DrawCards.createEvent(this.props);
    
                expect(this.event.reason).toBe('reason');
                expect(this.event.source).toBe('source');
            });   
        });
    });
});
