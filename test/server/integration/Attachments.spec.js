describe('attachments', function() {
    integration(function() {
        describe('when an attachment is placed', function() {
            beforeEach(function() {
                const deck = this.buildDeck('Law Dogs', [
                    'Law Dogs',
                    'Tommy Harden', 'Jake Smiley', 'Pearl-Handled Revolver', 'Shotgun'
                ], ['Tommy Harden', 'Jake Smiley']
                );
                this.player1.selectDeck(deck);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.jake] = this.player1.filterCardsByName('Jake Smiley', 'play area');
                [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                this.revolver = this.player1.filterCardsByName('Pearl-Handled Revolver')[0];
                this.shotgun = this.player1.filterCardsByName('Shotgun')[0];
                this.player1.dragCard(this.shotgun, 'hand');
                this.player1.dragCard(this.revolver, 'hand');

                this.player1.clickMenu(this.shotgun, 'Shoppin\' play');
                this.player1.clickCard(this.tommy, 'play area');
                this.player1.clickMenu(this.revolver, 'Shoppin\' play');
                this.player1.clickCard(this.jake, 'play area');
            });

            it('should apply the attachment effect', function() {
                expect(this.tommy.bullets).toBe(2);
                expect(this.jake.isStud()).toBe(true);
            });
        });

        // TODO M2 this currently does not work. If for example dude ends up with 2 weapons after 
        // Shoppin or Tradin, they should discard down to 1 (there are exceptions of course)
        xdescribe('when an attachment becomes invalid', function() {
            beforeEach(function() {
                const deck = this.buildDeck('Law Dogs', [
                    'Law Dogs',
                    'Tommy Harden', 'Jake Smiley', 'Pearl-Handled Revolver', 'Shotgun'
                ], ['Tommy Harden', 'Jake Smiley']
                );
                this.player1.selectDeck(deck);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                this.revolver = this.player1.filterCardsByName('Pearl-Handled Revolver')[0];
                this.shotgun = this.player1.filterCardsByName('Shotgun')[0];
                this.player1.dragCard(this.shotgun, 'hand');
                this.player1.dragCard(this.revolver, 'hand');

                this.player1.clickMenu(this.shotgun, 'Shoppin\' play');
                this.player1.clickCard(this.tommy, 'play area');
                this.player1.clickMenu(this.revolver, 'Shoppin\' play');
                this.player1.clickCard(this.tommy, 'play area');
            });

            it('should discard the attachment', function() {
                expect(this.shotgun.location).toBe('discard pile');
                expect(this.tommy.attachments).not.toContain(this.shotgun);
            });
        });

        describe('when the card an attachment is placed on leaves play', function() {
            beforeEach(function() {
                const deck = this.buildDeck('Law Dogs', [
                    'Law Dogs',
                    'Tommy Harden', 'Jake Smiley', 'Shotgun'
                ], ['Tommy Harden', 'Jake Smiley']
                );
                this.player1.selectDeck(deck);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                this.shotgun = this.player1.filterCardsByName('Shotgun')[0];
                this.player1.dragCard(this.shotgun, 'hand');

                this.player1.clickMenu(this.shotgun, 'Shoppin\' play');
                this.player1.clickCard(this.tommy, 'play area');

                this.player1.dragCard(this.tommy, 'dead pile');
            });

            it('should place the attachment in discard', function() {
                expect(this.shotgun.location).toBe('discard pile');
                expect(this.player1.player.discardPile).toContain(this.shotgun);
            });
        });
    });
});
