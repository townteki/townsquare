const TraitTriggeredAbilityWindow = require('../../../server/game/gamesteps/TraitTriggeredAbilityWindow');

describe('TraitTriggeredAbilityWindow', function() {
    beforeEach(function() {
        this.player1Spy = jasmine.createSpyObj('player', ['isTimerEnabled']);
        this.player1Spy.name = 'player1';
        this.player2Spy = jasmine.createSpyObj('player', ['isTimerEnabled']);
        this.player2Spy.name = 'player2';

        this.gameSpy = jasmine.createSpyObj('game', ['getFirstPlayer', 'promptWithMenu', 'resolveAbility']);
        this.gameSpy.getFirstPlayer.and.returnValue(this.player1Spy);

        this.eventSpy = jasmine.createSpyObj('event', ['emitTo', 'getConcurrentEvents', 'getPrimaryEvent']);
        this.eventSpy.attachedEvents = [];
        this.eventSpy.getConcurrentEvents.and.returnValue([this.eventSpy]);
        this.eventSpy.getPrimaryEvent.and.returnValue(this.eventSpy);

        this.window = new TraitTriggeredAbilityWindow(this.gameSpy, {
            event: this.eventSpy,
            abilityType: 'traitbeforereaction'
        });

        function createCard(properties) {
            let cardSpy = jasmine.createSpyObj('card', ['getSummary']);
            Object.assign(cardSpy, properties);
            return cardSpy;
        }

        function createAbility(card, context) {
            let ability = jasmine.createSpyObj('ability', ['createContext', 'getChoices', 'canResolve']);
            ability.card = card;
            ability.createContext.and.returnValue([context]);
            ability.getChoices.and.returnValue([{ choice: 'default' }]);
            ability.canResolve.and.returnValue(true);
            return ability;
        }

        this.context1 = { context: 1, player: this.player1Spy, event: this.eventSpy };
        this.abilityCard1 = createCard({ card: 1, title: 'The Card', controller: this.player1Spy });
        this.ability1Spy = createAbility(this.abilityCard1, this.context1);

        this.context2 = { context: 2, player: this.player1Spy, event: this.eventSpy };
        this.abilityCard2 = createCard({ card: 2, title: 'The Card 2', controller: this.player1Spy });
        this.ability2Spy = createAbility(this.abilityCard2, this.context2);

        this.context3 = { context: 3, player: this.player2Spy, event: this.eventSpy };
        this.abilityCard3 = createCard({ card: 3, title: 'Their Card', controller: this.player2Spy });
        this.ability3Spy = createAbility(this.abilityCard3, this.context3);

        spyOn(this.window, 'gatherChoices');
        spyOn(this.window, 'resolveAbility');
    });

    describe('continue()', function() {
        describe('when there are no remaining choices', function() {
            beforeEach(function() {
                this.result = this.window.continue();
            });

            it('should not prompt', function() {
                expect(this.gameSpy.promptWithMenu).not.toHaveBeenCalled();
            });

            it('should complete the prompt', function() {
                expect(this.result).toBe(true);
            });
        });

        describe('when there is only 1 choice', function() {
            beforeEach(function() {
                this.window.gatherChoices.and.callFake(() => {
                    this.window.registerAbility(this.ability1Spy, this.eventSpy);
                });

                this.result = this.window.continue();
            });

            it('should resolve the ability', function() {
                expect(this.window.resolveAbility).toHaveBeenCalledWith(this.ability1Spy, this.context1);
            });

            it('should not prompt', function() {
                expect(this.gameSpy.promptWithMenu).not.toHaveBeenCalled();
            });

            it('should not complete the prompt', function() {
                // The execution of the forced ability may raise additional
                // abilities in the same window. Thus, the prompt should be kept
                // open until there are 0 abilities left in the window.
                // e.g. At Prince Doran's Behest could be the only 'When Revealed'
                // ability, but itself could reveal another 'When Revealed'
                // ability in the same window.
                expect(this.result).toBe(false);
            });
        });

        describe('when there are multiple choices', function() {
            beforeEach(function() {
                this.window.gatherChoices.and.callFake(() => {
                    this.window.registerAbility(this.ability1Spy, this.eventSpy);
                    this.window.registerAbility(this.ability2Spy, this.eventSpy);
                    this.window.registerAbility(this.ability3Spy, this.eventSpy);
                });
                this.result = this.window.continue();
            });

            it('should prompt the first player for order of their traits', function() {
                expect(this.gameSpy.promptWithMenu).toHaveBeenCalledWith(this.player1Spy, this.window, jasmine.objectContaining({
                    activePrompt: {
                        menuTitle: jasmine.any(String),
                        buttons: [
                            jasmine.objectContaining({ text: 'The Card', arg: jasmine.any(String), method: 'chooseAbility' }),
                            jasmine.objectContaining({ text: 'The Card 2', arg: jasmine.any(String), method: 'chooseAbility' })
                        ]
                    }
                }));
            });

            it('should continue to prompt', function() {
                expect(this.result).toBe(false);
            });
        });
    });

    describe('chooseAbility()', function() {
        beforeEach(function() {
            this.window.registerAbility(this.ability1Spy, this.eventSpy);
            this.choiceId = this.window.abilityChoices[0].id;
        });

        describe('when the player select a non-existent choice', function() {
            beforeEach(function() {
                this.window.chooseAbility(this.player1Spy, 'foo');
            });

            it('should not resolve an ability', function() {
                expect(this.window.resolveAbility).not.toHaveBeenCalled();
            });
        });

        describe('when the player selects a valid choice', function() {
            beforeEach(function() {
                this.window.chooseAbility(this.player1Spy, this.choiceId);
            });

            it('should resolve the ability', function() {
                expect(this.window.resolveAbility).toHaveBeenCalledWith(this.ability1Spy, this.context1);
            });
        });
    });
});
