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
        describe('when amount and desiredAmount are equal', () => {
            it('should return desiredAmount', () => {
                var props = { amount: 2, desiredAmount: 2};
                var cards = player.drawDeckAction(props, jasmine.createSpy('callback'));
                expect(cards.length).toBe(2);
            });

            it('should call callback for each card', () => {
                var props = { amount: 2, desiredAmount: 2};
                var callback = jasmine.createSpy('callback');
                player.searchDrawDeck(props, callback);

                expect(callback).toHaveBeenCalledTimes(2);
            });
        });

        describe('when desiredAmount is greater than amount', () => {
            it('should return desiredAmount', () => {
                var props = { amount: 1, desiredAmount: 2};
                var cards = player.drawDeckAction(props, card => {
                    player.drawDeck = player.drawDeck.filter(drawCard => card !== drawCard);
                });
                expect(cards.length).toBe(2);
            });

            it('should call callback for each card', () => {
                var props = { amount: 1, desiredAmount: 2};
                var callback = jasmine.createSpy('callback');
                player.drawDeckAction(props, callback);

                expect(callback).toHaveBeenCalledTimes(2);
            });

            it('shuffles discard to draw deck', () => {
                var props = { amount: 1, desiredAmount: 2};
                var callback = jasmine.createSpy('callback');
                player.shuffleDiscardToDrawDeck = jasmine.createSpy('shuffleDiscardToDrawDeck');
                player.drawDeckAction(props, callback);

                expect(player.shuffleDiscardToDrawDeck).toHaveBeenCalledTimes(1);
            });
        });
    });
});
