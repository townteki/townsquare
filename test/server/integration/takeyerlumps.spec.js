const Hands = require('../../helpers/hands');

describe('Take Yer Lumps', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('step', function() {
            beforeEach(function() {
                const deck1 = this.buildDeck({
                    outfitTitle: 'Law Dogs',
                    cardTitles: ['Law Dogs', 'Clyde Owens', 'Jake Smiley', 'Jacqueline Isham'],
                    startingTitles: ['Clyde Owens', 'Jake Smiley', 'Jacqueline Isham']
                });
                const deck2 = this.buildDeck({
                    outfitTitle: 'The Sloane Gang',
                    cardTitles: ['The Sloane Gang', 'Allie Hensman', 'Baker Andrews', 'Pedro', 'Pinned Down', 'Pinned Down'], 
                    startingTitles: ['Allie Hensman', 'Baker Andrews']
                });
                this.player1.selectDeck(deck1);
                this.player2.selectDeck(deck2);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.clyde] = this.player1.filterCardsByName('Clyde Owens', 'play area');
                [this.jake] = this.player1.filterCardsByName('Jake Smiley', 'play area');
                [this.jacqueline] = this.player1.filterCardsByName('Jacqueline Isham', 'play area');
                [this.baker] = this.player2.filterCardsByName('Baker Andrews', 'play area');
                [this.pedro] = this.player2.filterCardsByName('Pedro');
                this.pinnedDowns = this.player2.filterCardsByName('Pinned Down');
                this.player2.dragCard(this.pedro, 'hand');
                this.pinnedDowns.forEach(card => this.player2.dragCard(card, 'hand'));

                this.player1.clickPrompt('Pass');
                this.player2.clickMenu(this.pedro, 'Shoppin\' play');
                this.player2.clickCard(this.baker, 'play area');

                this.player1.moveDude(this.clyde, 'townsquare');
                this.player1.moveDude(this.jake, 'townsquare');
                this.player1.moveDude(this.jacqueline, 'townsquare');
                this.player2.moveDude(this.baker, 'townsquare');

                this.player1.clickMenu(this.jake, 'Call Out');
                this.player1.clickCard(this.baker, 'play area');

                this.player2.clickPrompt('Accept Callout');

                this.player1.clickCard(this.clyde, 'play area');
                this.player1.clickCard(this.jacqueline, 'play area');
                this.player1.clickCard(this.jake, 'play area');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
            });

            describe('when taking casualties', function() {
                beforeEach(function() {
                    this.completeShootoutPlaysStep();
                    this.player1.clickCard(this.clyde, 'play area');
                });

                describe('game should', function() {
                    beforeEach(function() {
                        this.player1.prepareHand(Hands.getHand(this.player1, Hands.HighCard));
                        this.player2.prepareHand(Hands.getHand(this.player2, Hands.TwoOfKind));
                        this.player1.clickPrompt('Ready');
                        this.player2.clickPrompt('Ready');
                        this.completeShootoutResolutionStep();
                    });
    
                    it('show yes/no prompt if selected casualties will cover more than required', function() {
                        this.player1.clickPrompt('Ace');
                        this.player1.clickCard(this.clyde, 'play area');
                        expect(this.player1.player.promptState.menuTitle).toContain('will cover more');
                        expect(this.player1).toHavePromptButton('Yes');
                    });
                });                

                describe('game should', function() {
                    beforeEach(function() {
                        this.player1.prepareHand(Hands.getHand(this.player1, Hands.HighCard));
                        this.player2.prepareHand(Hands.getHand(this.player2, Hands.Straight));
                        this.player1.clickPrompt('Ready');
                        this.player2.clickPrompt('Ready');
                        this.completeShootoutResolutionStep();
                    });
    
                    it('show yes/no prompt if selected casualties will not cover all', function() {
                        this.player1.clickPrompt('Discard');
                        this.player1.clickCard(this.clyde, 'play area');
                        expect(this.player1.player.promptState.menuTitle).toContain('will not cover');
                        expect(this.player1).toHavePromptButton('Yes');
                    });
    
                    it('continue with the casualties step', function() {
                        this.player1.clickPrompt('Ace');
                        this.player1.clickCard(this.clyde, 'play area');
                        expect(this.player1.player.promptState.menuTitle).not.toContain('Do you want to continue?');
                        expect(this.player1).not.toHavePromptButton('Yes');
                    });
                });                
            });

            describe('when resolving first casualties', function() {
                beforeEach(function() {
                    this.player1.clickPrompt('Pass');
                    this.player2.clickMenu(this.pinnedDowns[0], 'Use ability');
                    this.player2.clickCard(this.clyde, 'play area');
                    this.player1.clickPrompt('Pass');
                    this.player2.clickMenu(this.pinnedDowns[1], 'Use ability');
                    this.player2.clickCard(this.jacqueline, 'play area');
                    this.player1.clickPrompt('Pass');
                    this.player2.clickPrompt('Pass');
                    this.player1.clickCard(this.clyde, 'play area'); 
                    this.player1.prepareHand(Hands.getHand(this.player1, Hands.HighCard));
                    this.player2.prepareHand(Hands.getHand(this.player2, Hands.Straight));
                    this.player1.clickPrompt('Ready');
                    this.player2.clickPrompt('Ready');
                    this.completeShootoutResolutionStep();                                            
                });

                it('correct cards should be selectable', function() {
                    expect(this.player1.player.getSelectableCards()).toContain(this.clyde);
                    expect(this.player1.player.getSelectableCards()).toContain(this.jacqueline);
                    expect(this.player1.player.getSelectableCards()).not.toContain(this.jake);
                });                
            });      
        });
    });
});
