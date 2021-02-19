const UnbootCard = require('../../../server/game/GameActions/UnbootCard');

describe('UnbootCard', function() {
    beforeEach(function() {
        this.cardSpy = jasmine.createSpyObj('card', ['allowGameAction']);
        this.cardSpy.booted = true;
        this.cardSpy.location = 'play area';
        this.props = { card: this.cardSpy };
    });

    describe('allow()', function() {
        beforeEach(function() {
            this.cardSpy.allowGameAction.and.returnValue(true);
        });

        describe('when the card is in play area', function() {
            beforeEach(function() {
                this.cardSpy.location = 'play area';
            });

            it('returns true', function() {
                expect(UnbootCard.allow(this.props)).toBe(true);
            });
        });

        describe('when the card is already unbooted', function() {
            beforeEach(function() {
                this.cardSpy.booted = false;
            });

            it('returns false', function() {
                expect(UnbootCard.allow(this.props)).toBe(false);
            });
        });

        describe('when the card is not in a bootable area', function() {
            beforeEach(function() {
                this.cardSpy.location = 'dead pile';
            });

            it('returns false', function() {
                expect(UnbootCard.allow(this.props)).toBe(false);
            });
        });
    });

    describe('createEvent()', function() {
        beforeEach(function() {
            this.event = UnbootCard.createEvent(this.props);
        });

        it('creates a onCardStood event', function() {
            expect(this.event.name).toBe('onCardUnbooted');
            expect(this.event.card).toBe(this.cardSpy);
        });

        describe('the event handler', function() {
            beforeEach(function() {
                this.event.executeHandler();
            });

            it('unboots the card', function() {
                expect(this.cardSpy.booted).toBe(false);
            });
        });
    });
});
