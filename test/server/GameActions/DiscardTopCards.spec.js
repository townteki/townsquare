const DiscardTopCards = require('../../../server/game/GameActions/DiscardTopCards');

describe('DiscardTopCards', function() {
    beforeEach(function() {
        this.playerSpy = jasmine.createSpyObj('player', ['moveCard']);
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
});
