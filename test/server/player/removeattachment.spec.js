const Player = require('../../../server/game/player.js');
const DrawCard = require('../../../server/game/drawcard.js');

describe('Player', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['addMessage', 'queueSimpleStep', 'raiseEvent', 'resolveEvent']);
        this.gameSpy.queueSimpleStep.and.callFake(step => step());
        this.player = new Player('1', {username: 'Player 1', settings: {}}, true, this.gameSpy);
        this.player.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
        this.player.addOutfitToTown.and.callFake(function() {});
        this.player.deck = {};
        this.player.initialise();
        this.player.phase = 'high noon';
        this.attachmentOwner = new Player('2', {username: 'Player 2', settings: {}}, false, this.gameSpy);
        this.attachmentOwner.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
        this.attachmentOwner.addOutfitToTown.and.callFake(function() {});
        this.attachmentOwner.initialise();
        this.attachment = new DrawCard(this.attachmentOwner, {});
        spyOn(this.attachment, 'canAttach').and.returnValue(true);
        this.card = new DrawCard(this.player, {});
        this.card.location = 'play area';
        this.player.cardsInPlay.push(this.card);
        this.player.attach(this.player, this.attachment, this.card);

        this.gameSpy.raiseEvent.and.callFake((name, params, handler) => {
            if(handler) {
                handler(params);
            }
        });
    });

    describe('removeAttachment', function() {
        beforeEach(function() {
            spyOn(this.attachment, 'leavesPlay');
            this.attachment.location = 'play area';
            this.player.removeAttachment(this.attachment);
        });
        it('should leave play', function() {
            expect(this.attachment.leavesPlay).toHaveBeenCalled();
        });
        it('should remove the attachment from its parent', function() {
            expect(this.card.attachments).not.toContain(this.attachment);
        });
        it('should unset its parent property', function() {
            expect(this.attachment.parent).toBeUndefined();
        });
        it('should return the attachment to its owners discard pile', function() {
            expect(this.attachmentOwner.hand).not.toContain(this.attachment);
            expect(this.attachmentOwner.discardPile).toContain(this.attachment);
        });
    });
});
