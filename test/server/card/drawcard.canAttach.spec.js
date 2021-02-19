const DrawCard = require('../../../server/game/drawcard.js');

describe('DrawCard', function() {
    beforeEach(function() {
        this.owner = {
            game: jasmine.createSpyObj('game', ['raiseEvent'])
        };
    });

    describe('canAttach()', function() {
        describe('when the card is an attachment', function() {
            beforeEach(function() {
                this.targetCard = new DrawCard(this.owner, { type_code: 'dude' });
                this.targetCard.location = 'play area';
                this.attachment = new DrawCard(this.owner, { type_code: 'goods' });
            });

            it('should return true', function() {
                expect(this.attachment.canAttach(this.player, this.targetCard)).toBe(true);
            });

            describe('when the target card is not a deed or dude', function() {
                beforeEach(function() {
                    spyOn(this.targetCard, 'getType').and.returnValue('spell');
                });

                it('should return false', function() {
                    expect(this.attachment.canAttach(this.player, this.targetCard)).toBe(false);
                });
            });

            // TODO M2 enable and update once attachment restrictions are implemented for DTR
            xdescribe('when custom restrictions are added', function() {
                beforeEach(function() {
                    this.matcherSpy = jasmine.createSpy('matcher');
                    this.attachment.attachmentRestriction(this.matcherSpy);
                });

                it('should call the matcher', function() {
                    this.attachment.canAttach(this.player, this.targetCard);
                    expect(this.matcherSpy).toHaveBeenCalledWith(this.targetCard, jasmine.objectContaining({ player: this.player }));
                });

                it('should return the result of the matcher', function() {
                    this.matcherSpy.and.returnValue(true);
                    expect(this.attachment.canAttach(this.player, this.targetCard)).toBe(true);
                });
            });
        });

        describe('when the card is not an attachment', function() {
            beforeEach(function() {
                this.targetCard = new DrawCard(this.owner, { text: '' });
                this.attachment = new DrawCard(this.owner, { type_code: 'action' });
            });

            it('should return false', function() {
                expect(this.attachment.canAttach(this.player, this.targetCard)).toBe(false);
            });
        });
    });
});
