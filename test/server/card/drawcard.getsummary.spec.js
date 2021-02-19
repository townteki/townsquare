const DrawCard = require('../../../server/game/drawcard');

describe('DrawCard', function () {
    function createPlayerSpy(name) {
        let player = jasmine.createSpyObj('player', ['getCardSelectionState', 'isSpectator']);
        player.name = name;
        return player;
    }

    beforeEach(function () {
        this.gameSpy = jasmine.createSpyObj('game', ['isCardVisible']);
        this.gameSpy.isCardVisible.and.returnValue(true);
        this.testCard = { code: '111', title: 'test 1', gang_code: 'neutral' };
        this.card = new DrawCard({}, this.testCard);
        this.card.game = this.gameSpy;
        this.activePlayer = createPlayerSpy('player1');
        this.card.owner = this.activePlayer;
    });

    describe('getSummary', function() {
        describe('strength property', function() {
            describe('when the card has non-zero strength', function() {
                beforeEach(function() {
                    this.card.bullets = 5;
                    this.summary = this.card.getSummary(this.activePlayer, false);
                });

                it('should include the strength', function() {
                    expect(this.summary.bullets).toBe(5);
                });
            });

            describe('when the card has a zero strength', function() {
                beforeEach(function() {
                    this.card.bullets = 0;
                    this.summary = this.card.getSummary(this.activePlayer, false);
                });

                it('should include the strength', function() {
                    expect(this.summary.bullets).toBe(0);
                });
            });
        });

        describe('when a card is not visible', function() {
            beforeEach(function() {
                this.card.bullets = 5;
                let anotherPlayer = createPlayerSpy('player2');
                this.gameSpy.isCardVisible.and.returnValue(false);
                this.summary = this.card.getSummary(anotherPlayer);
            });

            it('should not include bullets', function() {
                expect(this.summary.bullets).toBeUndefined();
            });

            it('should not include influence', function() {
                expect(this.summary.influence).toBeUndefined();
            });

            it('should not include keywords', function() {
                expect(this.summary.keywords).toBeUndefined();
            });

            it('should not include location', function() {
                expect(this.summary.location).toBeUndefined();
            });
        });
    });
});
