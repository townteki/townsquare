const ShoppinCardAction = require('../../../server/game/PlayActions/ShoppinCardAction');

describe('ShoppinCardAction', function () {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['addMessage', 'on', 'raiseEvent', 'removeListener', 'resolveGameAction']);
        this.gameSpy.raiseEvent.and.callFake(function(name, params, handler) {
            handler({ context: params.context, playingType: params.playingType, target: params.target });
        });
        this.playerSpy = jasmine.createSpyObj('player', ['canPutIntoPlay', 'isCardInPlayableLocation', 'putIntoPlay']);
        this.cardSpy = jasmine.createSpyObj('card', ['getType']);
        this.cardSpy.controller = this.playerSpy;
        this.cardSpy.owner = this.playerSpy;
        this.context = {
            game: this.gameSpy,
            player: this.playerSpy,
            source: this.cardSpy
        };
        //this.gameSpy.resolveGameAction = jasmine.createSpy('resolveGameAction');
        this.gameSpy.resolveGameAction.and.callFake(() => { 
            return { thenExecute: () => { 
                return { thenExecute: () => true };
            }};
        });
        this.action = new ShoppinCardAction();
    });

    describe('meetsRequirements()', function() {
        beforeEach(function() {
            this.gameSpy.currentPhase = 'high noon';
            this.playerSpy.canPutIntoPlay.and.returnValue(true);
            this.playerSpy.isCardInPlayableLocation.and.returnValue(true);
            this.cardSpy.location = 'hand';
            this.cardSpy.getType.and.returnValue('dude');
        });

        describe('when all conditions are met', function() {
            it('should return true', function() {
                expect(this.action.meetsRequirements(this.context)).toBe(true);
            });
        });

        describe('when the phase not high noon', function() {
            beforeEach(function() {
                this.gameSpy.currentPhase = 'gambling';
            });

            it('should return false', function() {
                expect(this.action.meetsRequirements(this.context)).toBe(false);
            });
        });

        describe('when the card is not in a valid location', function() {
            beforeEach(function() {
                this.playerSpy.isCardInPlayableLocation.and.returnValue(false);
            });

            it('should return false', function() {
                expect(this.action.meetsRequirements(this.context)).toBe(false);
            });
        });

        describe('when the card is an action', function() {
            beforeEach(function() {
                this.cardSpy.getType.and.returnValue('action');
            });

            it('should return false', function() {
                expect(this.action.meetsRequirements(this.context)).toBe(false);
            });
        });

        describe('when the card cannot be put into play', function() {
            beforeEach(function() {
                this.playerSpy.canPutIntoPlay.and.returnValue(false);
            });

            it('should return false', function() {
                expect(this.action.meetsRequirements(this.context)).toBe(false);
            });
        });
    });

    describe('executeHandler()', function() {
        beforeEach(function() {
            this.action.executeHandler(this.context);
        });

        it('should put the card into play', function() {
            // TODO M2 should probably do a better test to see if GameActions.putIntoPlay was called
            expect(this.gameSpy.resolveGameAction).toHaveBeenCalled();
        });
    });
});
