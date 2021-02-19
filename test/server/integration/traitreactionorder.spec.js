describe('trait reaction order', function() {
    integration({ numOfPlayers: 2 }, function() {
        beforeEach(function() {
            const deck1 = this.buildDeck('Law Dogs', [
                'Law Dogs',
                'Tommy Harden', 'Philip Swinford'
            ], ['Tommy Harden']
            );
            const deck2 = this.buildDeck('The Sloane Gang', [
                'The Sloane Gang',
                'Barton Everest'
            ], ['Barton Everest']
            );
            this.player1.selectDeck(deck1);
            this.player2.selectDeck(deck2);
            this.startGame();
            this.skipToHighNoonPhase();

            [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
            [this.barton] = this.player2.filterCardsByName('Barton Everest', 'play area');
            // we do not want philip out before lowball as he could have his trait triggered
            [this.philip] = this.player1.filterCardsByName('Philip Swinford');
            this.player1.dragCard(this.philip, 'play area', 'townsquare');
            if(this.player1.hasPrompt('Are you perfoming Shoppin\' play?')) {
                this.player1.clickPrompt('No');
            }

            this.player1.moveDude(this.tommy, 'townsquare');
            this.player2.moveDude(this.barton, 'townsquare');

            this.player1.clickMenu(this.philip, 'Call Out');
            this.player1.clickCard(this.barton, 'play area');

            this.player2.clickPrompt('Accept Callout');

            this.player1.clickCard(this.tommy, 'play area');
            this.player1.clickPrompt('Done');
            this.player2.clickPrompt('Done');

            this.completeShootoutPlaysStep();
            this.player1.clickCard(this.tommy, 'play area');

            this.drawHandCards1 = [];
            this.drawHandCards1.push(this.player1.filterCardsByName('Mustang')[0]);
            this.drawHandCards1.push(this.player1.filterCardsByName('Roan')[0]);
            this.drawHandCards1.push(this.player1.filterCardsByName('Hustings')[0]);
            this.drawHandCards1.push(this.player1.filterCardsByName('Shotgun')[0]);
            this.drawHandCards1.push(this.player1.filterCardsByName('Bunkhouse')[0]);

            this.player1.prepareHand(this.drawHandCards1);
            this.player1.clickPrompt('Ready');

            this.drawHandCards2 = this.player2.filterCardsByName('Mustang');
            this.drawHandCards2 = this.drawHandCards2.concat(this.player2.filterCardsByName('Roan'));
            this.drawHandCards2.push(this.player2.filterCardsByName('Ambush')[0]);

            this.player2.prepareHand(this.drawHandCards2);
            this.player2.clickPrompt('Ready');
        });

        it('should prompt the first player', function() {
            expect(this.player1).toHavePromptButton('Tommy Harden');
            expect(this.player1).toHavePromptButton('Philip Swinford');
        });

        it('should allow the abilities to be triggered', function() {
            this.player1.clickPrompt('Philip Swinford');
            expect(this.player1).toHavePrompt('Do you want to discard a card to draw a card?');

            this.player1.clickPrompt('Yes');
            this.player1.clickPrompt('Done');
            expect(this.player1.player.rankModifier).toBeGreaterThan(0);
        });
    });
});
