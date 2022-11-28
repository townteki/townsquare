const Effects = require('../../../server/game/effects.js');

describe('Effects.dynamicKeywords', function() {
    beforeEach(function() {
        this.context = {};
        this.context.game = jasmine.createSpyObj('game', ['applyGameAction']);
        this.context.game.applyGameAction.and.callFake((action, card, callback) => callback(card));
        this.calculateMethod = jasmine.createSpy('calculateMethod');

        this.card1 = jasmine.createSpyObj('card1', ['addKeyword', 'removeKeyword']);
        this.card1.uuid = '1111';
        this.card2 = jasmine.createSpyObj('card2', ['addKeyword', 'removeKeyword']);
        this.card2.uuid = '2222';

        this.effect = Effects.dynamicKeywords(this.calculateMethod);
    });

    describe('apply()', function() {
        beforeEach(function() {
            this.calculateMethod.and.returnValue(['keyword1', 'keyword2']);
            this.effect.apply(this.card1, this.context);
            this.calculateMethod.and.returnValue(['keyword3']);
            this.effect.apply(this.card2, this.context);
        });

        it('should modify keywords based on the result of the calculate method', function() {
            expect(this.card1.addKeyword).toHaveBeenCalledWith('keyword1');
            expect(this.card1.addKeyword).toHaveBeenCalledWith('keyword2');
            expect(this.card2.addKeyword).toHaveBeenCalledWith('keyword3');
        });

        it('should store the modifier for each card on context', function() {
            expect(Object.keys(this.context.dynamicKeywords).length).toBe(2);
        });
    });

    describe('reapply()', function() {
        beforeEach(function() {
            this.calculateMethod.and.returnValue(['keyword1']);
            this.effect.apply(this.card1, this.context);
            this.calculateMethod.and.returnValue(['keyword2']);
            this.effect.reapply(this.card1, this.context);
        });

        it('should change keywords', function() {
            expect(this.card1.removeKeyword).toHaveBeenCalledWith('keyword1');
            expect(this.card1.addKeyword).toHaveBeenCalledWith('keyword2');
        });
    });

    describe('unapply()', function() {
        beforeEach(function() {
            this.calculateMethod.and.returnValue(['keyword1', 'keyword2']);
            this.effect.apply(this.card1, this.context);
            this.calculateMethod.and.returnValue(['keyword3']);
            this.effect.apply(this.card2, this.context);
        });

        it('should remove the previously added keywords', function() {
            this.effect.unapply(this.card1, this.context);
            this.effect.unapply(this.card2, this.context);
            expect(this.card1.removeKeyword).toHaveBeenCalledWith('keyword1');
            expect(this.card1.removeKeyword).toHaveBeenCalledWith('keyword2');
            expect(this.card2.removeKeyword).toHaveBeenCalledWith('keyword3');
        });
    });
});
