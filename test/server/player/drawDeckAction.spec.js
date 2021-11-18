const Player = require('../../../server/game/player.js');

describe('the Player', () => {
    var game = jasmine.createSpyObj('game', ['raiseEvent']);

    var player = new Player('1', {username: 'Player 1', settings: {}}, true, game);
    player.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
    player.addOutfitToTown.and.callFake(function() {});
    var drawDeck = [
        { title: 'card1' },
        { title: 'card2' }
    ];

    beforeEach(() => {
        player.deck = drawDeck;
        player.initialise();

        player.drawDeck = drawDeck;
    });

    describe('the drawDeckAction() function', () => {
        describe('when amount is less than # of cards in deck', () => {
            it('should return amount of cards', () => {
                var cards = player.drawDeckAction(2, jasmine.createSpy('callback'));
                expect(cards.length).toBe(2);
            });

            it('should call callback for each card', () => {
                var callback = jasmine.createSpy('callback');
                player.searchDrawDeck(2, callback);

                expect(callback).toHaveBeenCalledTimes(2);
            });
        });

        describe('when amount is greater than # cards in draw deck', () => {
            it('should return amount of cards', () => {
                var cards = player.drawDeckAction(2, card => {
                    player.drawDeck = player.drawDeck.filter(drawCard => card !== drawCard);
                });
                expect(cards.length).toBe(2);
            });

            it('should call callback for each card', () => {
                var callback = jasmine.createSpy('callback');
                player.drawDeckAction(2, callback);

                expect(callback).toHaveBeenCalledTimes(2);
            });

            it('shuffles discard to draw deck', () => {
                var callback = jasmine.createSpy('callback');
                player.shuffleDiscardToDrawDeck = jasmine.createSpy('shuffleDiscardToDrawDeck');
                player.drawDeckAction(3, callback);

                expect(player.shuffleDiscardToDrawDeck).toHaveBeenCalledTimes(1);
            });
        });
    });
});
