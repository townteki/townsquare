const DrawCard = require('../../../server/game/drawcard.js');
const {Tokens} = require('../../../server/game/Constants');

describe('DrawCard', function () {
    beforeEach(function () {
        this.testCard = { code: '111', title: 'test 1' };
        this.gameSpy = jasmine.createSpyObj('game', ['raiseEvent']);
        this.card = new DrawCard({ game: this.gameSpy }, this.testCard);
        spyOn(this.card.events, 'register');
        spyOn(this.card.events, 'unregisterAll');
    });

    describe('moveTo()', function() {
        it('should set the location', function() {
            this.card.moveTo('hand');
            expect(this.card.location).toBe('hand');
        });

        describe('when the card has tokens on it', function() {
            beforeEach(function() {
                this.card.location = 'play area';
                this.card.modifyGhostRock(1);
                this.card.modifyToken(Tokens.bounty, 2);
            });

            describe('when moving the card between areas', function() {
                beforeEach(function() {
                    this.card.moveTo('hand');
                });

                it('should remove any ghostrock on the card', function() {
                    expect(this.card.ghostrock).toBe(0);
                });

                it('should remove any tokens on the card', function() {
                    expect(this.card.tokens[Tokens.bounty]).toBeUndefined();
                });
            });

            describe('when moving the card within the same parent', function() {
                beforeEach(function() {
                    this.card.parent = jasmine.createSpyObj('parent1', ['removeChildCard', 'removeAttachment']);
                    this.card.moveTo('play area', jasmine.createSpyObj('parent2', ['removeChildCard']));
                });

                it('should not remove any ghostrock on the card', function() {
                    expect(this.card.ghostrock).toBe(1);
                });

                it('should not remove any tokens on the card', function() {
                    expect(this.card.tokens[Tokens.bounty]).toBe(2);
                });
            });
        });

        describe('when the card is facedown', function() {
            beforeEach(function() {
                this.card.facedown = true;
            });

            describe('when moved to the play area', function() {
                beforeEach(function() {
                    this.card.moveTo('play area');
                });

                it('should not flip the card', function() {
                    expect(this.card.facedown).toBe(true);
                });
            });

            describe('when moved to somewhere other than the play area', function() {
                beforeEach(function() {
                    this.card.moveTo('hand');
                });

                it('should flip the card', function() {
                    expect(this.card.facedown).toBe(false);
                });
            });
        });

        describe('when the card has events', function() {
            beforeEach(function() {
                this.card.registerEvents(['foo', 'bar']);
            });

            describe('when in a non-event handling area', function() {
                beforeEach(function() {
                    this.card.location = 'discard pile';
                });

                describe('and moving to another non-event handling area', function() {
                    beforeEach(function() {
                        this.card.moveTo('dead pile');
                    });

                    it('should not register events', function() {
                        expect(this.card.events.register).not.toHaveBeenCalled();
                    });

                    it('should not unregister events', function() {
                        expect(this.card.events.unregisterAll).not.toHaveBeenCalled();
                    });
                });

                describe('and moving to an event handling area', function() {
                    beforeEach(function() {
                        this.card.moveTo('play area');
                    });

                    it('should register events', function() {
                        expect(this.card.events.register).toHaveBeenCalledWith(['foo', 'bar']);
                    });

                    it('should not unregister events', function() {
                        expect(this.card.events.unregisterAll).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when in an event handling area', function() {
                beforeEach(function() {
                    this.card.location = 'play area';
                });

                describe('and moving to another event handling area', function() {
                    beforeEach(function() {
                        this.card.moveTo('play area');
                    });

                    it('should not register events', function() {
                        expect(this.card.events.register).not.toHaveBeenCalled();
                    });

                    it('should not unregister events', function() {
                        expect(this.card.events.unregisterAll).not.toHaveBeenCalled();
                    });
                });

                describe('and moving to a non-event handling area', function() {
                    beforeEach(function() {
                        this.card.moveTo('draw deck');
                    });

                    it('should not register events', function() {
                        expect(this.card.events.register).not.toHaveBeenCalled();
                    });

                    it('should unregister events', function() {
                        expect(this.card.events.unregisterAll).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
