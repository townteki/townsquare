const CardMatcher = require('../../server/game/CardMatcher.js');

describe('CardMatcher', function() {
    beforeEach(function() {
        this.cardSpy = jasmine.createSpyObj('card', ['getType', 'isInLeaderPosse', 'isInOpposingPosse', 'isParticipating', 'isUnique', 'isWanted']);
    });

    describe('.isMatch', function() {
        describe('in leader posse', function() {
            it('returns true if the card is in leader posse', function() {
                this.cardSpy.isInLeaderPosse.and.returnValue(true);
                expect(CardMatcher.isMatch(this.cardSpy, { inLeaderPosse: true })).toBe(true);
            });

            it('returns false if the card is not in leader posse', function() {
                this.cardSpy.isInLeaderPosse.and.returnValue(false);
                expect(CardMatcher.isMatch(this.cardSpy, { inLeaderPosse: true })).toBe(false);
            });
        });

        describe('in opposing posse', function() {
            it('returns true if the card is in opposing posse', function() {
                this.cardSpy.isInOpposingPosse.and.returnValue(true);
                expect(CardMatcher.isMatch(this.cardSpy, { inOpposingPosse: true })).toBe(true);
            });

            it('returns false if the card is not in opposing posse', function() {
                this.cardSpy.isInOpposingPosse.and.returnValue(false);
                expect(CardMatcher.isMatch(this.cardSpy, { inOpposingPosse: true })).toBe(false);
            });
        });

        describe('participating', function() {
            beforeEach(function() {
                this.cardSpy.game = { shootout: {}};
            });
            it('returns true if the card is participating', function() {
                this.cardSpy.isParticipating.and.returnValue(true);
                expect(CardMatcher.isMatch(this.cardSpy, { participating: true })).toBe(true);
            });

            it('returns false if the card is not participating', function() {
                this.cardSpy.isParticipating.and.returnValue(false);
                expect(CardMatcher.isMatch(this.cardSpy, { participating: true })).toBe(false);
            });

            describe('shootout is null', function() {
                it('returns false if the card is participating', function() {
                    this.cardSpy.game = {};
                    expect(CardMatcher.isMatch(this.cardSpy, { participating: true })).toBe(true);
                });
            });
        });

        describe('wanted', function() {
            beforeEach(function() {
                this.cardSpy.getType.and.returnValue('dude');
            });
            it('returns true if the card is wanted', function() {
                this.cardSpy.isWanted.and.returnValue(true);
                expect(CardMatcher.isMatch(this.cardSpy, { wanted: true })).toBe(true);
            });

            it('returns false if the card is not wanted', function() {
                this.cardSpy.isWanted.and.returnValue(false);
                expect(CardMatcher.isMatch(this.cardSpy, { wanted: true })).toBe(false);
            });

            it('returns false if the card is not dude', function() {
                this.cardSpy.getType.and.returnValue('deed');
                expect(CardMatcher.isMatch(this.cardSpy, { wanted: true })).toBe(false);
            });
        });
    });

    describe('createAttachmentMatcher', function() {
        beforeEach(function() {
            let controller = { controller: 1 };
            this.context = { player: controller };
            this.cardSpy.controller = controller;
            this.cardSpy.getType.and.returnValue('dude');
        });

        describe('defaults', function() {
            beforeEach(function() {
                this.matcher = CardMatcher.createAttachmentMatcher({});
            });

            it('should match dudes', function() {
                expect(this.matcher(this.cardSpy, this.context)).toBe(true);
            });

            it('should not match non-dudes', function() {
                this.cardSpy.getType.and.returnValue('deed');
                expect(this.matcher(this.cardSpy, this.context)).toBe(false);
            });
        });

        describe('controller', function() {
            describe('when a specific value', function() {
                beforeEach(function() {
                    this.controller = { controller: 1 };
                    this.matcher = CardMatcher.createAttachmentMatcher({ controller: this.controller });
                });

                it('should return true when it matches', function() {
                    this.cardSpy.controller = this.controller;
                    expect(this.matcher(this.cardSpy, this.context)).toBe(true);
                });

                it('should return false when it does not match', function() {
                    this.cardSpy.controller = { controller: 2 };
                    expect(this.matcher(this.cardSpy, this.context)).toBe(false);
                });
            });

            describe('when the value is \'current\'', function() {
                beforeEach(function() {
                    this.matcher = CardMatcher.createAttachmentMatcher({ controller: 'current' });
                });

                it('should return true when the controller is the same as the context player', function() {
                    this.cardSpy.controller = this.context.player;
                    expect(this.matcher(this.cardSpy, this.context)).toBe(true);
                });

                it('should return false when the controller is different from the context player', function() {
                    this.cardSpy.controller = { controller: 2 };
                    expect(this.matcher(this.cardSpy, this.context)).toBe(false);
                });
            });

            describe('when the value is \'opponent\'', function() {
                beforeEach(function() {
                    this.matcher = CardMatcher.createAttachmentMatcher({ controller: 'opponent' });
                });

                it('should return false when the controller is the same as the context player', function() {
                    this.cardSpy.controller = this.context.player;
                    expect(this.matcher(this.cardSpy, this.context)).toBe(false);
                });

                it('should return true when the controller is different from the context player', function() {
                    this.cardSpy.controller = { controller: 2 };
                    expect(this.matcher(this.cardSpy, this.context)).toBe(true);
                });
            });
        });
    });
});
