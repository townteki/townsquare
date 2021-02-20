// TODO M2 finish this test
xdescribe('time limit', function() {
    integration(function() {
        describe('when a game has a time limit', function() {
            beforeEach(function() {

            });

            it('the time limit does not start until the setup phase has finished', function() {
                expect(this.game.timeLimit.timeLimitStarted).toBe(false);
            });

            it('the time limit starts when the setup phase has finished', function() {
                this.completeSetup();
                expect(this.game.timeLimit.timeLimitStarted).toBe(true);
            });

            describe('the game correctly determines the winner', function() {
                beforeEach(function() {

                });

                it('based on rules', function() {

                });
            });
        });
    });
});
