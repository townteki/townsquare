describe('ability limits', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('when an ability has a limit', function() {
            beforeEach(function() {
                const deck = this.buildDeck('Law Dogs', [
                    'Law Dogs',
                    'Jacqueline Isham', 'Jake Smiley'
                ], ['Jacqueline Isham', 'Jake Smiley']
                );
                this.player1.selectDeck(deck);
                this.player2.selectDeck(deck);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.jake] = this.player1.filterCardsByName('Jake Smiley', 'play area');
                [this.jacqueline] = this.player2.filterCardsByName('Jacqueline Isham', 'play area');

                this.player1.moveDude(this.jake, 'townsquare');
                this.player2.moveDude(this.jacqueline, 'townsquare');

                this.player1.clickMenu(this.jake, 'Call Out');
                this.player1.clickCard(this.jacqueline, 'play area');

                this.player2.clickPrompt('Accept Callout');

                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');

                this.player2.clickCard(this.jacqueline, 'play area');
                this.removeFromPosse(this.jake);
                this.completeShootoutPlaysStep();
                this.player2.clickPrompt('Pass');

                this.player1.clickMenu(this.jake, 'Call Out');
                this.player1.clickCard(this.jacqueline, 'play area');

                this.player2.clickPrompt('Accept Callout');

                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
            });

            it('should allow multiple reactions for repeat react', function() {
                expect(this.player2).toAllowAbilityTrigger('Jacqueline Isham');
            });

            //TODO M2 add here some card with react on shootout start that is not repeatable
        });

        //TODO M2 add here test when shootout ability is canceled
        xdescribe('when a non repeatable ability is canceled', function() {
            beforeEach(function() {

            });

            it('should not allow the ability to be triggered again', function() {
                expect(this.player2).not.toAllowAbilityTrigger('some card');
            });
        });
    });
});
