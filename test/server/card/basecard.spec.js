const BaseCard = require('../../../server/game/basecard.js');
const KeywordsProperty = require('../../../server/game/PropertyTypes/KeywordsProperty.js');

describe('BaseCard', function () {
    beforeEach(function () {
        this.testCard = { code: '111', title: 'test 1', gang_code: 'neutral' };
        this.limitedCard = { code: '1234', text: 'Limited.', gang_code: 'neutral' };
        this.nonLimitedCard = { code: '2222', text: 'Stealth.', gang_code: 'neutral' };
        this.game = jasmine.createSpyObj('game', ['isCardVisible', 'raiseEvent']);
        this.owner = jasmine.createSpyObj('owner', ['getCardSelectionState', 'isSpectator']);
        this.owner.getCardSelectionState.and.returnValue({});
        this.owner.game = this.game;
        this.card = new BaseCard(this.owner, this.testCard);
    });

    describe('when new instance created', function() {
        it('should generate a new uuid', function() {
            expect(this.card.uuid).not.toBeUndefined();
        });
    });

    describe('.parseKeywords', function() {
        it('parses keywords without numeric value', function() {
            const keywords = new KeywordsProperty('Private • Ranch • Out of Town');
            expect(keywords.size()).toBe(3);
            expect(keywords.getValues()).toContain('private');
            expect(keywords.getValues()).toContain('ranch');
            expect(keywords.getValues()).toContain('out of town');
        });

        it('parses keywords with numeric values', function() {
            const keywords = new KeywordsProperty('Blessed 1 • Mad Scientist 0 • Difficulty 8');

            expect(keywords.size()).toBe(3);
            expect(keywords.getValues()).toContain('blessed');
            expect(keywords.getValues()).toContain('mad scientist');
            expect(keywords.getValues()).toContain('difficulty');
            expect(keywords.modifiers['blessed'].printed).toBe(1);
            expect(keywords.modifiers['mad scientist'].printed).toBe(0);
            expect(keywords.modifiers['difficulty'].printed).toBe(8);
        });

        it('parses difficulty keywords', function() {
            const keywords1 = new KeywordsProperty('Gadget 6');
            const keywords2 = new KeywordsProperty('Miracle 7');
            const keywords3 = new KeywordsProperty('Hex 9');
            const keywords4 = new KeywordsProperty('Spirit 5');

            expect(keywords1.size()).toBe(1);
            expect(keywords2.size()).toBe(1);
            expect(keywords3.size()).toBe(1);
            expect(keywords4.size()).toBe(1);
            expect(keywords1.getValues()).toContain('gadget');
            expect(keywords2.getValues()).toContain('miracle');
            expect(keywords3.getValues()).toContain('hex');
            expect(keywords4.getValues()).toContain('spirit');
            expect(keywords1.modifiers['difficulty'].printed).toBe(6);
            expect(keywords2.modifiers['difficulty'].printed).toBe(7);
            expect(keywords3.modifiers['difficulty'].printed).toBe(9);
            expect(keywords4.modifiers['difficulty'].printed).toBe(5);
        });
    });

    describe('doAction()', function() {
        describe('when there is no action for the card', function() {
            beforeEach(function() {
                this.card.abilities.actions = [];
            });

            it('does not crash', function() {
                expect(() => this.card.doAction('player', 0)).not.toThrow();
            });
        });

        describe('when there are actions for the card', function() {
            beforeEach(function() {
                this.actionSpy1 = jasmine.createSpyObj('action', ['execute']);
                this.actionSpy2 = jasmine.createSpyObj('action', ['execute']);
                this.card.abilities.actions = [this.actionSpy1, this.actionSpy2];
            });

            it('should call execute on the action with the appropriate index', function() {
                this.card.doAction('player', 1);
                expect(this.actionSpy2.execute).toHaveBeenCalledWith('player');
            });

            it('should handle out of bounds indices', function() {
                this.card.doAction('player', 3);
                expect(this.actionSpy1.execute).not.toHaveBeenCalled();
                expect(this.actionSpy2.execute).not.toHaveBeenCalled();
            });
        });
    });

    describe('getSummary', function() {
        describe('when is visible to the active player', function() {
            beforeEach(function () {
                this.game.isCardVisible.and.returnValue(true);
                this.summary = this.card.getSummary(this.owner);
            });

            describe('and card is faceup', function() {
                it('should return card data', function() {
                    expect(this.summary.uuid).toEqual(this.card.uuid);
                    expect(this.summary.title).toEqual(this.testCard.title);
                    expect(this.summary.code).toEqual(this.testCard.code);
                });

                it('should not return facedown', function() {
                    expect(this.summary.facedown).toBeFalsy();
                });
            });

            describe('and card is facedown', function() {
                beforeEach(function () {
                    this.card.facedown = true;
                    this.summary = this.card.getSummary(this.owner);
                });

                it('should return card data', function() {
                    expect(this.summary.uuid).toEqual(this.card.uuid);
                    expect(this.summary.title).toEqual(this.testCard.title);
                    expect(this.summary.code).toEqual(this.testCard.code);
                });

                it('should return facedown', function() {
                    expect(this.summary.facedown).toBe(true);
                });
            });
        });

        describe('when is not visible to active player', function() {
            beforeEach(function () {
                this.game.isCardVisible.and.returnValue(false);
                this.anotherPlayer = jasmine.createSpyObj('owner', ['getCardSelectionState']);
                this.anotherPlayer.getCardSelectionState.and.returnValue({});
                this.summary = this.card.getSummary(this.anotherPlayer);
            });

            describe('and card is faceup', function() {
                it('should return no card data', function () {
                    expect(this.summary.title).toBeUndefined();
                    expect(this.summary.code).toBeUndefined();
                });

                it('should return the uuid', function() {
                    expect(this.summary.uuid).not.toBeUndefined();
                });

                it('should return facedown', function() {
                    expect(this.summary.facedown).toBe(true);
                });
            });

            describe('and card is facedown', function() {
                beforeEach(function () {
                    this.card.facedown = true;
                    this.summary = this.card.getSummary(this.anotherPlayer);
                });

                it('should return no card data', function() {
                    expect(this.summary.title).toBeUndefined();
                    expect(this.summary.code).toBeUndefined();
                });

                it('should return facedown', function() {
                    expect(this.summary.facedown).toBe(true);
                });

                it('should return the uuid', function() {
                    expect(this.summary.uuid).not.toBeUndefined();
                });
            });
        });
    });

    describe('allowGameAction()', function() {
        describe('when there are no restrictions', function() {
            it('should return true', function() {
                expect(this.card.allowGameAction('ace')).toBe(true);
            });
        });

        describe('when there are restrictions', function() {
            beforeEach(function() {
                this.game.currentAbilityContext = { context: 1 };
                this.restrictionSpy1 = jasmine.createSpyObj('restriction', ['isMatch']);
                this.restrictionSpy2 = jasmine.createSpyObj('restriction', ['isMatch']);
                this.card.addAbilityRestriction(this.restrictionSpy1);
                this.card.addAbilityRestriction(this.restrictionSpy2);
            });

            it('should check each restriction', function() {
                this.card.allowGameAction('ace');
                expect(this.restrictionSpy1.isMatch).toHaveBeenCalledWith('ace', this.game.currentAbilityContext, this.owner);
                expect(this.restrictionSpy2.isMatch).toHaveBeenCalledWith('ace', this.game.currentAbilityContext, this.owner);
            });

            describe('and there are no matching restrictions', function() {
                it('should return true', function() {
                    expect(this.card.allowGameAction('ace')).toBe(true);
                });
            });

            describe('and at least one matches', function() {
                beforeEach(function() {
                    this.restrictionSpy2.isMatch.and.returnValue(true);
                });

                it('should return false', function() {
                    expect(this.card.allowGameAction('ace')).toBe(false);
                });
            });
        });
    });

    describe('tokens', function() {
        it('should not have tokens by default', function() {
            expect(this.card.hasToken('foo')).toBe(false);
        });

        describe('adding a token', function() {
            it('should increase the tokens by the given amount', function() {
                this.card.modifyToken('foo', 1);

                expect(this.card.tokens.foo).toBe(1);
                expect(this.card.hasToken('foo')).toBe(true);
            });
        });

        describe('removing an existing tokens', function() {
            beforeEach(function() {
                this.card.modifyToken('foo', 2);
            });

            it('should reduce the tokens by the given amount', function() {
                this.card.modifyToken('foo', -1);

                expect(this.card.tokens.foo).toBe(1);
                expect(this.card.hasToken('foo')).toBe(true);

                this.card.modifyToken('foo', -1);
                expect(this.card.hasToken('foo')).toBe(false);
            });
        });

        describe('remove a missing token', function() {
            it('should not set the token value', function() {
                this.card.modifyToken('foo', -1);

                expect(this.card.tokens.foo).toBeUndefined();
                expect(this.card.hasToken('foo')).toBe(false);
            });
        });
    });
});
