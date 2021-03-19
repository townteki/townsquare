describe('Legend', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('card type', function() {
            beforeEach(function() {
                const deck1 = this.buildDeck({
                    outfitTitle: 'Law Dogs',
                    cardTitles: ['Law Dogs', 'Tommy Harden'],
                    startingTitles: ['Tommy Harden'],
                    legendTitle: 'Doc Holliday'
                });
                const deck2 = this.buildDeck({
                    outfitTitle: 'The Sloane Gang',
                    cardTitles: ['The Sloane Gang', 'Barton Everest'], 
                    startingTitles: ['Barton Everest']
                });
                this.player1.selectDeck(deck1);
                this.player2.selectDeck(deck2);
                this.startGame();
            });
            
            describe('on setup', function() {
                it('should decrease wealth', function() {
                    expect(this.player1.player.ghostrock).toBe(18);
                });

                it('should attach legend to outfit', function() {
                    expect(this.player1.player.legend.parent).toBe(this.player1.player.outfit);
                });  
                
                it('should move legend to "play area" location', function() {
                    expect(this.player1.player.legend.location).toBe('play area');
                }); 
            });

            describe('during play', function() {
                beforeEach(function() {
                    this.skipToHighNoonPhase();

                    [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                    [this.barton] = this.player2.filterCardsByName('Barton Everest', 'play area');

                    this.player1.moveDude(this.tommy, 'townsquare');
                    this.player2.moveDude(this.barton, 'townsquare');
                });

                describe('if legend condition met', function() {
                    beforeEach(function() {
                        this.player1.clickMenu(this.tommy, 'Call Out');
                        this.player1.clickCard(this.barton, 'play area');
                        this.player2.clickPrompt('Accept Callout');
                    });

                    it('should apply effects', function() {
                        expect(this.game.shootout.leaderPosse.studBonus).toBe(-2);
                    });
                });

                describe('if legend condition is not met', function() {
                    beforeEach(function() {
                        this.player2.clickMenu(this.barton, 'Call Out');
                        this.player2.clickCard(this.tommy, 'play area');
                        this.player1.clickPrompt('Accept Callout');
                    });

                    it('should not apply effects', function() {
                        expect(this.game.shootout.leaderPosse.studBonus).toBe(0);
                    });
                });
            });
        });
    });
});
