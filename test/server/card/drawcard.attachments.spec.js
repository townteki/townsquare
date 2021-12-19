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
        this.gameSpy.effectEngine = jasmine.createSpyObj('effectEngine', ['getAppliedEffectsOnCard']);
        this.gameSpy.effectEngine.getAppliedEffectsOnCard.and.returnValue([]);
        this.testCard = { code: '111', title: 'test 1', gang_code: 'neutral' };
        this.card = new DrawCard({}, this.testCard);
        this.card.game = this.gameSpy;
        this.activePlayer = createPlayerSpy('player1');
        this.card.owner = this.activePlayer;
    });

    describe('attachments', function() {
        describe('does not cause errors', function() {
            describe('when there are no attachments', function() {
                it('should return false for hasAttachmentWithKeywords', function() {
                    expect(this.card.hasAttachmentWithKeywords('weapon')).toBe(false);
                });
                it('should return empty for getAttachmentByKeywords', function() {
                    expect(this.card.getAttachmentsByKeywords('weapon')).toEqual([]);
                });
            });
        });
    });
});
