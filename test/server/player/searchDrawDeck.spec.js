const Player = require('../../../server/game/player.js');

describe('the Player', () => {
    var game = jasmine.createSpyObj('game', ['raiseEvent']);

    var player = new Player('1', {username: 'Player 1', settings: {}}, true, game);
    player.addOutfitToTown = jasmine.createSpy('addOutfitToTown');
    player.addOutfitToTown.and.callFake(function() {});
    var drawDeck = [
        { title: 'foo' },
        { title: 'bar' },
        { title: 'baz' },
        { title: 'ball' }
    ];

    beforeEach(() => {
        player.deck = drawDeck;
        player.initialise();

        player.drawDeck = drawDeck;
    });

    describe('the searchDrawDeck() function', () => {
        describe('when no limit is passed', () => {
            it('should search all cards in the deck', () => {
                var cards = player.searchDrawDeck(() => {
                    return true;
                });
                expect(cards.length).toBe(drawDeck.length);
            });

            it('should filter the results using the predicate', () => {
                var cards = player.searchDrawDeck((card) => {
                    return card.title === 'bar';
                });

                expect(cards.length).toBe(1);
            });
        });

        describe('when a limit is passed but no predicate', () => {
            describe('when the limit is positive', () => {
                it('should return from the top of the deck', () => {
                    var cards = player.searchDrawDeck(2);

                    expect(cards.length).toBe(2);
                    expect(cards[0].title).toBe('foo');
                    expect(cards[1].title).toBe('bar');
                });
            });

            describe('when the limit is negative', () => {
                it('should return from the bottom of the deck', () => {
                    var cards = player.searchDrawDeck(-2);

                    expect(cards.length).toBe(2);
                    expect(cards[0].title).toBe('baz');
                    expect(cards[1].title).toBe('ball');
                });
            });
        });

        describe('when both a limit and a predicate are passed', () => {
            it('should limit and filter', () => {
                var cards = player.searchDrawDeck(3, (card) => {
                    return card.title[0] === 'b';
                });

                expect(cards.length).toBe(2);
                expect(cards[0].title).toBe('bar');
                expect(cards[1].title).toBe('baz');
            });
        });
    });
});
