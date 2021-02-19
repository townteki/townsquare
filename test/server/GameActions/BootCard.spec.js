const BootCard = require('../../../server/game/GameActions/BootCard');

describe('BootCard', function() {
    beforeEach(function() {
        this.cardSpy = jasmine.createSpyObj('card', ['allowGameAction']);
        this.cardSpy.booted = false;
        this.cardSpy.location = 'play area';
        this.props = { card: this.cardSpy };
    });

    describe('allow()', function() {
        beforeEach(function() {
            this.cardSpy.allowGameAction.and.returnValue(true);
        });

        describe('when the card is in play area', function() {
            it('returns true', function() {
                expect(BootCard.allow(this.props)).toBe(true);
            });
        });

        describe('when the card is already booted', function() {
            beforeEach(function() {
                this.cardSpy.booted = true;
            });

            it('returns false', function() {
                expect(BootCard.allow(this.props)).toBe(false);
            });
        });

        describe('when the card is not in a bootable area', function() {
            beforeEach(function() {
                this.cardSpy.location = 'dead pile';
            });

            it('returns false', function() {
                expect(BootCard.allow(this.props)).toBe(false);
            });
        });
    });

    describe('createEvent()', function() {
        beforeEach(function() {
            this.event = BootCard.createEvent(this.props);
        });

        it('creates a onCardKneeled event', function() {
            expect(this.event.name).toBe('onCardBooted');
            expect(this.event.card).toBe(this.cardSpy);
        });

        describe('the event handler', function() {
            beforeEach(function() {
                this.event.executeHandler();
            });

            it('kneels the card', function() {
                expect(this.cardSpy.booted).toBe(true);
            });
        });
    });
});
