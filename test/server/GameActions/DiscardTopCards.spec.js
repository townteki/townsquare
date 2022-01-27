const DiscardTopCards = require('../../../server/game/GameActions/DiscardTopCards');

describe('DiscardTopCards', function() {
    beforeEach(function() {
        this.playerSpy = jasmine.createSpyObj('player', ['drawDeckAction', 'moveCard']);
        this.deckSpy = jasmine.createSpyObj('drawDeck', ['length']);
        this.playerSpy.drawDeck = this.deckSpy;
        this.props = { player: this.playerSpy, amount: 0 };
    });

    describe('allow()', function() {
        describe('when the deck is empty', function() {
            it('returns false', function() {
                this.deckSpy.length = 0;
                this.props.amount = 10;
                expect(DiscardTopCards.allow(this.props)).toBe(false);
            });
        });

        describe('when the amount is zero', function() {
            it ('returns false', function() {
                this.props.amount = 0;
                this.deckSpy.length = 52;
                expect(DiscardTopCards.allow(this.props)).toBe(false);
            });
        });

        describe('when there are sufficient cards', function() {
            it('returns true', function() {
                this.deckSpy.length = 52;
                this.props.amount = 5;
                expect(DiscardTopCards.allow(this.props)).toBe(true);
            });
        });

        describe('when there some cards but not enough', function() {
            it('returns true', function() {
                this.deckSpy.length = 5;
                this.props.amount = 10;
                expect(DiscardTopCards.allow(this.props)).toBe(true);
            });
        });
    });

    describe('createEvent()', function() {
        beforeEach(function() {
            this.props.amount = 3;
            this.event = DiscardTopCards.createEvent(this.props);
        });

        it('creates a DiscardTopCards event', function() {
            expect(this.event.name).toBe('onTopCardsDiscarded');
            expect(this.event.amount).toBe(3);
        });

        describe('the event handler', function() {            
            it('draws the correct number of cards', function() {
                // Just return strings instead of full card objects, we're not testing the logic
                // of drawDeckAction() and the event doesn't care what they actually are.
                this.playerSpy.drawDeckAction.and.returnValue(['card1', 'card2', 'card3']);
                this.event.executeHandler();
                expect(this.playerSpy.drawDeckAction).toHaveBeenCalledWith(3, jasmine.any(Function));
                expect(this.event.topCards.length).toBe(3);
            });
        });
    });
});
