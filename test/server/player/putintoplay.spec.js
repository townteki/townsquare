const AttachmentPrompt = require('../../../server/game/gamesteps/attachmentprompt.js');
const Player = require('../../../server/game/player.js');

describe('Player', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['queueSimpleStep', 'queueStep', 'raiseEvent', 'resolveEvent', 'addMessage', 'takeControl']);
        this.player = new Player('1', {username: 'Player 1', settings: {}}, true, this.gameSpy);
        this.player.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
        this.player.addOutfitToTown.and.callFake(function() {});
        this.player.initialise();

        this.gameSpy.queueSimpleStep.and.callFake(func => func());

        this.cardSpy = jasmine.createSpyObj('card', [
            'getPrintedType', 'getCost', 'isUnique', 'applyPersistentEffects', 'moveTo', 'isToken', 'takeControl', 'getType', 'moveToLocation',
            'entersPlay', 'hasKeyword'
        ]);
        this.cardSpy.controller = this.player;
        this.cardSpy.owner = this.player;
        this.dupeCardSpy = jasmine.createSpyObj('dupecard', ['addDuplicate']);
        this.player.hand.push(this.cardSpy);
        this.cardSpy.location = 'hand';
        this.cardSpy.getType.and.returnValue('dude');
        this.context = {
            costs: { ghostrock: 1 }
        };
    });

    describe('putIntoPlay', function() {
        describe('when the playing type is shoppin', function() {
            beforeEach(function() {
                this.player.putIntoPlay(this.cardSpy, { playingType: 'shoppin', context: this.context });
            });
            it('should add the card to cards in play', function() {
                expect(this.player.cardsInPlay).toContain(this.cardSpy);
            });
            it('should be placed face up', function() {
                expect(this.cardSpy.facedown).toBe(false);
            });
            it('should apply effects for the card', function() {
                expect(this.cardSpy.applyPersistentEffects).toHaveBeenCalled();
            });
            it('should raise the onCardEntersPlay event', function() {
                expect(this.gameSpy.raiseEvent).toHaveBeenCalledWith('onCardEntersPlay', jasmine.objectContaining({ card: this.cardSpy, playingType: 'shoppin' }));
            });
        });

        describe('when card is an attachment', function() {
            beforeEach(function() {
                this.cardSpy.getType.and.returnValue('goods');
                this.player.putIntoPlay(this.cardSpy, { playingType: 'shoppin', context: this.context });
            });

            it('should prompt for attachment target', function() {
                expect(this.gameSpy.queueStep).toHaveBeenCalledWith(jasmine.any(AttachmentPrompt));
            });
            it('should not remove the card from hand', function() {
                expect(this.player.hand).toContain(this.cardSpy);
            });
        });

        describe('when the playing type is setup', function() {
            beforeEach(function() {
                this.gameSpy.currentPhase = 'setup';
                this.player.putIntoPlay(this.cardSpy, { playingType: 'setup', context: this.context });
            });
            it('should add the card to cards in play', function() {
                expect(this.player.cardsInPlay).toContain(this.cardSpy);
            });
            it('should not be placed face down', function() {
                expect(this.cardSpy.facedown).toBe(false);
            });
            it('should apply effects for the card', function() {
                expect(this.cardSpy.applyPersistentEffects).toHaveBeenCalledWith();
            });
            it('should raise the onCardEntersPlay event', function() {
                expect(this.gameSpy.raiseEvent).toHaveBeenCalledWith('onCardEntersPlay', jasmine.objectContaining({ card: this.cardSpy, playingType: 'setup' }));
            });
        });

        describe('when the card is not controlled by the player', function() {
            beforeEach(function() {
                this.opponent = new Player('2', {username: 'Player 2', settings: {}}, true, this.gameSpy);
                this.opponent.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
                this.opponent.addOutfitToTown.and.callFake(function() {});
                this.opponent.initialise();
                this.cardSpy.controller = this.opponent;
                this.cardSpy.owner = this.opponent;
                this.opponent.hand.push(this.cardSpy);
                this.player.hand = [];

                this.player.putIntoPlay(this.cardSpy, { playingType: 'shoppin', context: this.context });
            });

            it('should add the card to cards in play', function() {
                expect(this.player.cardsInPlay).toContain(this.cardSpy);
            });

            it('should remove the card from the other player', function() {
                expect(this.opponent.hand).not.toContain(this.cardSpy);
            });

            it('should transfer control to the player', function () {
                expect(this.cardSpy.controller).toBe(this.player);
            });
        });
    });
});
