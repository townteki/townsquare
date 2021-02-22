const JobAction = require('../../../server/game/jobaction.js');

describe('JobAction', function () {
    beforeEach(function () {
        this.gameSpy = jasmine.createSpyObj('game', [
            'raiseEvent', 'resolveGameAction', 'promptForSelect', 'addMessage'
        ]);
        this.gameSpy.resolveGameAction.and.callFake(() => { 
            return { thenExecute: () => true };
        });
        this.gameSpy.currentPhase = 'high noon';

        this.playerSpy = jasmine.createSpyObj('player', ['canTrigger']);
        this.playerSpy.canTrigger.and.returnValue(true);

        this.jobCardSpy = jasmine.createSpyObj('card', ['getPrintedType', 'isAnyBlank', 'getType', 'hasKeyword']);
        this.leaderSpy = jasmine.createSpyObj('card', ['getType', 'hasKeyword']);
        this.markSpy = jasmine.createSpyObj('card', ['getType', 'hasKeyword']);
        this.handlerSpy = jasmine.createSpy('handler');

        this.gameSpy.raiseEvent.and.callFake((name, params, handler) => {
            if(handler) {
                handler(params);
            }
        });

        this.properties = {
            title: 'Do the thing',
            handler: this.handlerSpy,
            onSuccess: () => true
        };
    });

    describe('constructor', function() {
        describe('onSuccess', function() {
            beforeEach(function() {
                this.context = {
                    player: 'player',
                    arg: 'arg',
                    foo: 'bar'
                };
            });

            describe('when onSuccess is missing', function() {
                beforeEach(function() {
                    this.properties = {
                        title: 'Do the thing',
                        handler: this.handlerSpy
                    };
                });

                it('should throw an error', function() {
                    expect(() => {
                        new JobAction(this.gameSpy, this.jobCardSpy, this.properties);
                    }).toThrow();
                });
            });
        });
    });

    describe('executeHandler()', function() {
        beforeEach(function() {
            this.player = this.playerSpy;
            this.jobCardSpy.controller = this.player;
            this.jobCardSpy.location = 'play area';
            this.context = {
                game: this.gameSpy,
                player: this.player,
                source: this.cardSpy,
                target: this.markSpy,
                ability: { card: this.jobCardSpy },
                arg: 'arg'
            };
        });

        describe('leader selection', function() {
            beforeEach(function() {
                this.action = new JobAction(this.gameSpy, this.jobCardSpy, this.properties);
                this.action.startJob = jasmine.createSpy('startJob');
            });

            describe('for job action on dude card', function() {
                beforeEach(function() {
                    this.jobCardSpy.getType.and.returnValue('dude');
                    this.action.executeHandler(this.context);
                });

                it('should select dude as leader', function() {
                    expect(this.action.startJob).toHaveBeenCalledWith(this.jobCardSpy, this.markSpy, this.context);
                });
            });

            describe('for action job card', function() {
                beforeEach(function() {
                    this.jobCardSpy.getType.and.returnValue('action');
                    this.action.executeHandler(this.context);
                });

                it('should prompt for job leader', function() {
                    expect(this.gameSpy.promptForSelect).toHaveBeenCalled();
                });
            });
        });

        describe('setResult()', function() {
            beforeEach(function() {
                this.action = new JobAction(this.gameSpy, this.jobCardSpy, this.properties);
                this.action.onSuccess = jasmine.createSpy('onSuccess');
                this.action.onFail = jasmine.createSpy('onFail');
                this.action.statusRecorded = false;
            });

            describe('when setting result as successful', function() {
                beforeEach(function() {
                    this.action.setResult(true, { mark: this.markSpy });
                });

                it('should call onSuccess', function() {
                    expect(this.action.onSuccess).toHaveBeenCalled();
                });
            });

            describe('when setting result as not successful', function() {
                beforeEach(function() {
                    this.action.setResult(false, { mark: this.markSpy });
                });

                it('should call onSuccess', function() {
                    expect(this.action.onFail).toHaveBeenCalled();
                });
            });
        });
    });
});
