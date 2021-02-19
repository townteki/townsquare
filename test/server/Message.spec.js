const Message = require('../../server/game/Message');
const DrawCard = require('../../server/game/drawcard');
const Spectator = require('../../server/game/spectator');

describe('Message', function() {
    describe('#flatten', function() {
        describe('when there are no args', function() {
            beforeEach(function() {
                this.message = new Message({ format: 'This is a message', args: {} });
            });

            it('returns the format', function() {
                expect(this.message.flatten()).toEqual(['This is a message']);
            });
        });

        describe('when there are positional arguments', function() {
            it('returns the interpolated arguments', function() {
                const message = new Message({ format: '{0} uses {1} to kill {2}', args: ['Player', 'Shotgun', 'Billy'] });
                expect(message.flatten()).toEqual(['Player', ' uses ', 'Shotgun', ' to kill ', 'Billy']);
            });

            it('excludes out of index arguments', function() {
                const message = new Message({ format: '{0} plays {1} to kill Billy', args: ['Player'] });
                expect(message.flatten()).toEqual(['Player', ' plays ', ' to kill Billy']);
            });
        });

        describe('when there are named arguments', function() {
            it('returns the interpolated arguments', function() {
                const message = new Message({
                    format: '{player} plays {card} to kill {target}',
                    args: {
                        player: 'Player',
                        card: 'Shotgun',
                        target: 'Billy'
                    }
                });
                expect(message.flatten()).toEqual(['Player', ' plays ', 'Shotgun', ' to kill ', 'Billy']);
            });

            it('excludes unknown arguments', function() {
                const message = new Message({
                    format: '{player} plays {card} to kill Billy',
                    args: {
                        player: 'Player'
                    }
                });
                expect(message.flatten()).toEqual(['Player', ' plays ', ' to kill Billy']);
            });
        });

        describe('argument formats', function() {
            describe('arrays', function() {
                describe('when there are no elements in the array', function() {
                    beforeEach(function() {
                        this.message = new Message({
                            format: 'Gunslinger kills {targets}',
                            args: {
                                targets: []
                            }
                        });
                    });

                    it('returns the empty string for the argument', function() {
                        expect(this.message.flatten()).toEqual(['Gunslinger kills ', '']);
                    });
                });

                describe('when there is a single element in the array', function() {
                    beforeEach(function() {
                        this.message = new Message({
                            format: 'Gunslinger kills {targets}',
                            args: {
                                targets: ['Bounty Hunter']
                            }
                        });
                    });

                    it('returns the interpolated argument', function() {
                        expect(this.message.flatten()).toEqual(['Gunslinger kills ', 'Bounty Hunter']);
                    });
                });

                describe('when there are two elements in the array', function() {
                    beforeEach(function() {
                        this.message = new Message({
                            format: 'Gunslinger kills {targets}',
                            args: {
                                targets: ['Sheriff', 'Bounty Hunter']
                            }
                        });
                    });

                    it('returns the interpolated arguments separated by an and', function() {
                        expect(this.message.flatten()).toEqual(['Gunslinger kills ', 'Sheriff', ', and ', 'Bounty Hunter']);
                    });
                });

                describe('when there are many elements in the array', function() {
                    beforeEach(function() {
                        this.message = new Message({
                            format: 'Gunslinger kills {targets}',
                            args: {
                                targets: ['Sheriff', 'Bounty Hunter', 'Citizen', 'The Mayor']
                            }
                        });
                    });

                    it('returns the interpolated arguments separated by commas and an and', function() {
                        expect(this.message.flatten()).toEqual(['Gunslinger kills ', 'Sheriff', ', ', 'Bounty Hunter', ', ', 'Citizen', ', and ', 'The Mayor']);
                    });
                });
            });

            describe('card objects', function() {
                beforeEach(function() {
                    const card = new DrawCard({}, {
                        code: '12345',
                        title: 'Funslinger Emtwo',
                        type_code: 'dude'
                    });
                    this.message = new Message({
                        format: 'Player 1 plays {card}',
                        args: { card }
                    });
                });

                it('converts the card argument', function() {
                    expect(this.message.flatten()).toEqual(['Player 1 plays ', { argType: 'card', code: '12345', label: 'Funslinger Emtwo', type: 'dude' }]);
                });
            });

            describe('player objects', function() {
                beforeEach(function() {
                    const player = new Spectator('1234', { username: 'Abram' });
                    this.message = new Message({
                        format: '{player} plays Funslinger Emtwo',
                        args: { player }
                    });
                });

                it('converts the player argument', function() {
                    expect(this.message.flatten()).toEqual([{ argType: 'nonAvatarPlayer', name: 'Abram' }, ' plays Funslinger Emtwo']);
                });
            });

            describe('nested messages', function() {
                beforeEach(function() {
                    this.nestedMessage = new Message({
                        format: 'draw {amount} cards',
                        args: {
                            amount: 3
                        }
                    });
                    this.parentMessage = new Message({
                        format: '{player} plays {card} to {nestedMessage}',
                        args: {
                            player: 'Player',
                            card: 'Shotgun',
                            nestedMessage: this.nestedMessage
                        }
                    });
                });

                it('interpolates and flattens the two messages', function() {
                    expect(this.parentMessage.flatten()).toEqual(['Player', ' plays ', 'Shotgun', ' to ', 'draw ', 3, ' cards']);
                });
            });
        });
    });
});
