const DrawCard = require('../../../server/game/drawcard.js');

describe('DrawCard', function() {
    beforeEach(function() {
        this.game = jasmine.createSpyObj('game', ['raiseEvent', 'applyGameAction']);
        this.player = jasmine.createSpyObj('player', ['discardCard']);
        this.player.game = this.game;
        this.card = new DrawCard(this.player, { bullets: 3 });
    });

    describe('get bullets', function() {
        describe('when the bullets has been modified', function() {
            beforeEach(function() {
                this.card.modifyBullets(1);
            });

            it('should return the modified bullets', function() {
                expect(this.card.bullets).toBe(4);
            });
        });

        describe('when the bullets has been modified below 0', function() {
            beforeEach(function() {
                this.card.modifyBullets(-4);
            });

            it('should return 0', function() {
                expect(this.card.currentBullets).toBe(-1);
                expect(this.card.bullets).toBe(0);
            });
        });

        describe('when requesting printed bullets', function() {
            beforeEach(function() {
                this.card.modifyBullets(1);
            });

            it('should return the base bullets', function() {
                expect(this.card.getPrintedStat('bullets')).toBe(3);
            });
        });
    });
});
