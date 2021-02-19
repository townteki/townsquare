const Player = require('../../../server/game/player.js');

describe('Player', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['raiseEvent']);
        this.gameSpy.townsquare = { uuid: '1' };
        this.player = new Player('1', { username: 'Player 1', settings: {} }, true, this.gameSpy);
        this.player.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
        this.player.addOutfitToTown.and.callFake(function() {});
        this.player.initialise();

        this.cardSpy = jasmine.createSpyObj('card', ['allowAttachment, getGameLocation']);
        this.cardSpy.player = this.player;
        this.cardSpy.allowAttachment = jasmine.createSpy('allowAttachment');
        this.cardSpy.allowAttachment.and.returnValue(true);
        this.cardSpy.getGameLocation = jasmine.createSpy('getGameLocation');
        this.cardSpy.location = 'play area';
        this.attachmentSpy = jasmine.createSpyObj('goods', ['canAttach']);
        this.attachmentSpy.canAttach.and.returnValue(true);
    });

    describe('canAttach()', function() {
        describe('when everything is correct', function() {
            it('should return true', function() {
                expect(this.player.canAttach(this.attachmentSpy, this.cardSpy)).toBe(true);
            });
        });

        describe('when the card is not in play area', function() {
            beforeEach(function() {
                this.cardSpy.location = 'hand';
            });

            it('should return false', function() {
                expect(this.player.canAttach(this.attachmentSpy, this.cardSpy)).toBe(false);
            });
        });

        describe('when shoppin in uncontrolled location', function() {
            it('should return false', function() {
                this.cardSpy.getGameLocation.and.callFake(function() {
                    return { controller: this.player, determineController: () => 'other' };
                });
                expect(this.player.canAttach(this.attachmentSpy, this.cardSpy, 'shoppin')).toBe(false);
            });
        });

        describe('when shoppin in controlled location', function() {
            beforeEach(function() {
                this.cardSpy.getGameLocation.and.callFake(function() {
                    return { controller: this.player, determineController: () => this.player };
                });
            });

            it('should return false if parent booted', function() {
                this.cardSpy.booted = true;
                expect(this.player.canAttach(this.attachmentSpy, this.cardSpy, 'shoppin')).toBe(false);
            });

            it('should return true if parent unbooted', function() {
                expect(this.player.canAttach(this.attachmentSpy, this.cardSpy, 'shoppin')).toBe(true);
            });
        });

        describe('when the attachment cannot be attached to the card', function() {
            beforeEach(function() {
                this.attachmentSpy.canAttach.and.returnValue(false);
            });

            it('should return false', function() {
                expect(this.player.canAttach(this.attachmentSpy, this.cardSpy)).toBe(false);
            });
        });
    });
});
