const Effects = require('../../../server/game/effects.js');

describe('Effects.dynamicBullets', function() {
    beforeEach(function() {
        this.context = {};
        this.context.game = jasmine.createSpyObj('game', ['applyGameAction']);
        this.context.game.applyGameAction.and.callFake((action, card, callback) => callback(card));
        this.calculateMethod = jasmine.createSpy('calculateMethod');

        this.card1 = jasmine.createSpyObj('card1', ['modifyBullets']);
        this.card1.uuid = '1111';
        this.card2 = jasmine.createSpyObj('card2', ['modifyBullets']);
        this.card2.uuid = '2222';

        this.effect = Effects.dynamicBullets(this.calculateMethod);
    });

    describe('apply()', function() {
        beforeEach(function() {
            this.calculateMethod.and.returnValue(3);
            this.effect.apply(this.card1, this.context);
            this.calculateMethod.and.returnValue(4);
            this.effect.apply(this.card2, this.context);
        });

        it('should modify bullets based on the result of the calculate method', function() {
            expect(this.card1.modifyBullets).toHaveBeenCalledWith(3, true);
            expect(this.card2.modifyBullets).toHaveBeenCalledWith(4, true);
        });

        it('should store the modifier for each card on context', function() {
            expect(Object.keys(this.context.dynamicBullets).length).toBe(2);
        });
    });

    describe('reapply()', function() {
        beforeEach(function() {
            this.calculateMethod.and.returnValue(3);
            this.effect.apply(this.card1, this.context);
            this.calculateMethod.and.returnValue(4);
            this.effect.reapply(this.card1, this.context);
        });

        it('should increase the bullets by the difference', function() {
            expect(this.card1.modifyBullets).toHaveBeenCalledWith(1, true);
        });
    });

    describe('unapply()', function() {
        beforeEach(function() {
            this.calculateMethod.and.returnValue(3);
            this.effect.apply(this.card1, this.context);
            this.calculateMethod.and.returnValue(4);
            this.effect.apply(this.card2, this.context);
        });

        it('should reduce the previously applied value', function() {
            this.effect.unapply(this.card1, this.context);
            this.effect.unapply(this.card2, this.context);
            expect(this.card1.modifyBullets).toHaveBeenCalledWith(-3, false);
            expect(this.card2.modifyBullets).toHaveBeenCalledWith(-4, false);
        });
    });
});
