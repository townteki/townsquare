describe('Shotgun', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('ability', function() {
            beforeEach(function() {
                const deck1 = this.buildDeck('Law Dogs', [
                    'Law Dogs',
                    'Tommy Harden', 'Jake Smiley', 'Jacqueline Isham'
                ], ['Tommy Harden', 'Jake Smiley', 'Jacqueline Isham']
                );
                const deck2 = this.buildDeck('The Sloane Gang', [
                    'The Sloane Gang',
                    'Allie Hensman', 'Barton Everest', 'Shotgun'
                ], ['Allie Hensman', 'Barton Everest']
                );
                this.player1.selectDeck(deck1);
                this.player2.selectDeck(deck2);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                [this.jake] = this.player1.filterCardsByName('Jake Smiley', 'play area');
                [this.jacqueline] = this.player1.filterCardsByName('Jacqueline Isham', 'play area');
                [this.barton] = this.player2.filterCardsByName('Barton Everest', 'play area');
                this.shotgun = this.player2.filterCardsByName('Shotgun')[0];
                this.player2.dragCard(this.shotgun, 'hand');

                this.player1.clickPrompt('Pass');
                this.player2.clickMenu(this.shotgun, 'Shoppin\' play');
                this.player2.clickCard(this.barton, 'play area');

                this.player1.moveDude(this.tommy, 'townsquare');
                this.player1.moveDude(this.jake, 'townsquare');
                this.player1.moveDude(this.jacqueline, 'townsquare');
                this.player2.moveDude(this.barton, 'townsquare');

                this.player1.clickMenu(this.jake, 'Call Out');
                this.player1.clickCard(this.barton, 'play area');

                this.player2.clickPrompt('Accept Callout');

                this.player1.clickCard(this.tommy, 'play area');
                this.player1.clickCard(this.jacqueline, 'play area');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');

                this.player1.clickPrompt('Pass');
                this.player2.clickMenu(this.shotgun, 'Use ability');
            });

            describe('should', function() {
                it('not allow to select dude with value higher than bullets', function() {
                    expect(this.player2).not.toAllowSelect(this.jacqueline);
                });

                it('allow to select dude with value equal to bullets', function() {
                    expect(this.player2).toAllowSelect(this.tommy);
                });

                it('allow to select dude with value lower than bullets', function() {
                    expect(this.player2).toAllowSelect(this.jake);
                });
            });

            describe('should ace', function() {
                beforeEach(function() {
                    this.player2.clickCard(this.jake, 'play area');
                });

                it('dude with lower value', function() {
                    expect(this.jake.location).toBe('dead pile');
                });
            });
        });
    });
});
