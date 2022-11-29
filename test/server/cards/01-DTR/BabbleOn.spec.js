describe('BabbleOn', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('ability', function() {
            beforeEach(function() {
                const deck1 = this.buildDeck({
                    outfitTitle: 'Law Dogs',
                    cardTitles: ['Law Dogs', 'Tommy Harden', 'Jake Smiley', 'Jacqueline Isham', 'Erik Samson', 'Old Man McDroste', 'Babble On', 'Lay On Hands', 'Soothe'],
                    startingTitles: ['Tommy Harden', 'Jake Smiley', 'Erik Samson', 'Jacqueline Isham', 'Old Man McDroste']
                });
                const deck2 = this.buildDeck({
                    outfitTitle: 'The Sloane Gang',
                    cardTitles: ['The Sloane Gang', 'Allie Hensman', 'Barton Everest', 'Shotgun'], 
                    startingTitles: ['Allie Hensman', 'Barton Everest']
                });
                this.player1.selectDeck(deck1);
                this.player2.selectDeck(deck2);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                [this.jake] = this.player1.filterCardsByName('Jake Smiley', 'play area');
                [this.erik] = this.player1.filterCardsByName('Erik Samson', 'play area');
                [this.barton] = this.player2.filterCardsByName('Barton Everest', 'play area');
                this.shotgun = this.player2.filterCardsByName('Shotgun')[0];
                this.babble = this.player1.filterCardsByName('Babble On')[0];
                this.layhands = this.player1.filterCardsByName('Lay On Hands')[0];
                this.player2.dragCard(this.shotgun, 'hand');
                this.player1.dragCard(this.babble, 'hand');
                this.player1.dragCard(this.layhands, 'hand');
                this.player1.dragCard(this.player1.filterCardsByName('Jacqueline Isham')[0], 'draw deck');
                this.player1.dragCard(this.player1.filterCardsByName('Old Man McDroste')[0], 'draw deck');

                this.player1.clickPrompt('Pass');
                this.player2.clickMenu(this.shotgun, 'Shoppin\' play');
                this.player2.clickCard(this.barton, 'play area');
                this.player1.clickMenu(this.babble, 'Shoppin\' play');
                this.player1.clickCard(this.erik, 'play area');
                this.player1.clickMenu(this.layhands, 'Shoppin\' play');
                this.player1.clickCard(this.erik, 'play area');

                this.player1.moveDude(this.tommy, 'townsquare');
                this.player1.moveDude(this.jake, 'townsquare');
                this.player1.moveDude(this.erik, 'townsquare');
                this.player2.moveDude(this.barton, 'townsquare');

                this.player1.clickMenu(this.jake, 'Call Out');
                this.player1.clickCard(this.barton, 'play area');

                this.player2.clickPrompt('Accept Callout');

                this.player1.clickCard(this.tommy, 'play area');
                this.player1.clickCard(this.erik, 'play area');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');

                this.player1.clickPrompt('Pass');
                this.player2.clickMenu(this.shotgun, 'Use ability');
                this.player2.clickCard(this.jake, 'play area');
                this.player1.clickCard(this.layhands, 'play area');
                this.player1.clickCard(this.babble, 'play area');
            });

            describe('should', function() {
                it('unboot Erik Samson', function() {
                    expect(this.erik.booted).toBe(false);
                });
            });
        });
    });
});
