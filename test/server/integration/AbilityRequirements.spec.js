describe('ability requirements', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('when an ability meets requirements after its triggering condition is fired', function() {
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

                this.player1.clickPrompt('Pass');
                this.player2.clickMenu(this.jacqueline, 'Call Out');
                this.player2.clickCard(this.jake, 'play area');

                this.player1.clickPrompt('Accept Callout');

                this.player2.clickPrompt('Done');
                this.player1.clickPrompt('Done');
            });

            it('should not prompt for the ability', function() {
                expect(this.player2).not.toAllowAbilityTrigger('Jacqueline Isham');
            });
        });

        // TODO M2 use here some card with non-repeatable ability
        xdescribe('when an ability leaves a playable area and re-enters a playable area', function() {
            beforeEach(function() {

            });

            it('should prompt for the ability', function() {
                expect(this.player1).toAllowAbilityTrigger('some card');
            });
        });
    });
});
