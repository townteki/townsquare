const ChooseYesNoPrompt = require('../../../server/game/gamesteps/ChooseYesNoPrompt');
const DropCommand = require('../../../server/game/ServerCommands/DropCommand');

describe('DropCommand', () => {
    describe('execute()', function() {
        beforeEach(function() {
            this.gameSpy = jasmine.createSpyObj('game', ['addAlert', 'queueStep']);
            this.playerSpy = jasmine.createSpyObj('player', ['discardCard', 'moveCard', 'putIntoPlay', 'aceCard']);

            this.cardSpy = jasmine.createSpyObj('card', ['allowGameAction', 'getType']);
            this.cardSpy.allowGameAction.and.returnValue(true);
            this.cardSpy.controller = this.cardSpy.owner = this.playerSpy;
            this.cardSpy.getType.and.returnValue('character');
            this.cardSpy.location = 'hand';

            this.executeForLocation = (targetLocation) => {
                let command = new DropCommand(this.gameSpy, this.playerSpy, this.cardSpy, targetLocation, 'gamelocation');
                command.execute();
            };
        });

        describe('when dragging a card to play area', function() {
            for(let type of ['goods', 'dude', 'deed']) {
                describe(`when the card is a ${type}`, function() {
                    beforeEach(function() {
                        this.cardSpy.getType.and.returnValue(type);

                        this.executeForLocation('play area');
                    });

                    it('should add the card to the play area', function() {
                        expect(this.gameSpy.queueStep).toHaveBeenCalledWith(jasmine.any(ChooseYesNoPrompt));
                    });
                });
            }

            describe('when the card is in hand and an event', function() {
                beforeEach(function() {
                    this.cardSpy.getType.and.returnValue('action');

                    this.executeForLocation('play area');
                });

                it('should not add the card to the play area', function() {
                    expect(this.playerSpy.putIntoPlay).not.toHaveBeenCalled();
                });
            });
        });

        describe('when dragging a card to the dead pile', function() {
            for(let type of ['goods', 'action', 'deed']) {
                describe(`when the card is a ${type}`, function() {
                    beforeEach(function() {
                        this.cardSpy.getType.and.returnValue(type);

                        this.executeForLocation('dead pile');
                    });

                    it('should not move the card', function() {
                        expect(this.playerSpy.moveCard).toHaveBeenCalled();
                    });
                });
            }

            describe('when the card is a dude', function() {
                beforeEach(function() {
                    this.cardSpy.getType.and.returnValue('dude');
                });

                describe('and the character is not in play', function() {
                    beforeEach(function() {
                        this.cardSpy.location = 'hand';

                        this.executeForLocation('dead pile');
                    });

                    it('should move the card directly', function() {
                        expect(this.playerSpy.moveCard).toHaveBeenCalledWith(this.cardSpy, 'dead pile');
                    });

                    it('should not ace the card', function() {
                        expect(this.playerSpy.aceCard).not.toHaveBeenCalled();
                    });
                });

                describe('and the character is in play', function() {
                    beforeEach(function() {
                        this.cardSpy.location = 'play area';

                        this.executeForLocation('dead pile');
                    });

                    it('should ace the dude', function() {
                        expect(this.playerSpy.aceCard).toHaveBeenCalledWith(this.cardSpy, jasmine.objectContaining({ allowSave: false, force: true }));
                    });
                });
            });
        });

        describe('when dragging a card to the discard pile', function() {
            for(let type of ['goods', 'dude', 'action', 'deed']) {
                describe(`when the card is a ${type}`, function() {
                    beforeEach(function() {
                        this.cardSpy.getType.and.returnValue(type);
                    });

                    describe('and it is not in play', function() {
                        beforeEach(function() {
                            this.cardSpy.location = 'dead pile';
                            this.executeForLocation('discard pile');
                        });

                        it('should move the card directly', function() {
                            expect(this.playerSpy.moveCard).toHaveBeenCalledWith(this.cardSpy, 'discard pile');
                        });

                        it('should not discard the card', function() {
                            expect(this.playerSpy.discardCard).not.toHaveBeenCalled();
                        });
                    });

                    describe('and it is in play', function() {
                        beforeEach(function() {
                            this.cardSpy.location = 'play area';
                            this.executeForLocation('discard pile');
                        });

                        it('should discard the card', function() {
                            expect(this.playerSpy.discardCard).toHaveBeenCalledWith(this.cardSpy, false, jasmine.objectContaining({ force: true }));
                        });
                    });
                });
            }
        });

        describe('when dragging a card to the deck', function() {
            for(let type of ['goods', 'dude', 'action', 'deed']) {
                describe(`when the card is a ${type}`, function() {
                    beforeEach(function() {
                        this.cardSpy.getType.and.returnValue(type);

                        this.executeForLocation('draw deck');
                    });

                    it('should discard the card', function() {
                        expect(this.playerSpy.moveCard).toHaveBeenCalledWith(this.cardSpy, 'draw deck');
                    });
                });
            }
        });
    });
});
