describe('JobAction', function() {
    integration({ numOfPlayers: 2 }, function() {
        describe('ability', function() {
            beforeEach(function() {
                const deck1 = this.buildDeck({
                    outfitTitle: 'Law Dogs',
                    cardTitles: ['Law Dogs', 'Tommy Harden', 'Jake Smiley', 'Olivia Jenks', 'A Coach Comes to Town'],
                    startingTitles: ['Tommy Harden', 'Jake Smiley', 'Olivia Jenks']
                });
                const deck2 = this.buildDeck({
                    outfitTitle: 'Desolation Row',
                    cardTitles: ['Desolation Row', 'Allie Hensman', 'Barton Everest', 'Maza Gang Hideout'], 
                    startingTitles: ['Allie Hensman', 'Barton Everest']
                });
                this.player1.selectDeck(deck1);
                this.player2.selectDeck(deck2);
                this.startGame();
                this.skipToHighNoonPhase();

                [this.tommy] = this.player1.filterCardsByName('Tommy Harden', 'play area');
                [this.jake] = this.player1.filterCardsByName('Jake Smiley', 'play area');
                [this.olivia] = this.player1.filterCardsByName('Olivia Jenks', 'play area');
                [this.barton] = this.player2.filterCardsByName('Barton Everest', 'play area');
                [this.allie] = this.player2.filterCardsByName('Allie Hensman', 'play area');
                this.coachAction = this.player1.filterCardsByName('A Coach Comes to Town')[0];
                this.maza = this.player2.filterCardsByName('Maza Gang Hideout')[0];
                this.desRow = this.player2.filterCardsByName('Desolation Row')[0];
                this.player1.dragCard(this.coachAction, 'hand');
                this.player2.dragCard(this.maza, 'hand');
                this.player2.clickMenu(this.maza, 'Shoppin\' play');
                this.player2.clickPrompt('Left');

                this.olivia.booted = true;
                this.player1.moveDude(this.tommy, 'townsquare');
                this.player2.moveDude(this.allie, this.maza.uuid);
            });

            describe('leaving posses after job', function() {
                beforeEach(function() {
                    this.player1.clickPrompt('Pass');
                    this.player2.clickMenu(this.desRow, 'Use ability');
                    this.player2.clickCard(this.allie, 'play area');
                    this.player2.clickPrompt('Done');
                    this.player1.clickPrompt('No');
                });

                it ('dudes should leave after onSuccessful() handler is done', function() {
                    expect(this.allie.bounty).toBe(2);
                });
            });

            describe('selecting posses', function() {
                beforeEach(function() {
                    this.player1.clickMenu(this.coachAction, 'Use ability');
                    this.player1.clickCard(this.tommy, 'play area');
                    this.player1.clickCard(this.jake, 'play area');
                });

                it ('booted dudes not at mark location are not selectable', function() {
                    expect(this.player1).not.toAllowSelect(this.olivia);
                });

                it ('dudes in location not adjacent to mark location are not selectable', function() {
                    this.player1.clickPrompt('Done');
                    expect(this.player2).not.toAllowSelect(this.allie);
                });
            });

            describe('deciding to oppose', function() {
                beforeEach(function() {
                    this.player1.clickMenu(this.coachAction, 'Use ability');
                    this.player1.clickCard(this.tommy, 'play area');
                    this.player1.clickCard(this.jake, 'play area');
                    this.player1.clickPrompt('Done');
                    this.jobAbility = this.game.shootout.options.jobAbility;   
                    this.jobAbility.setResult = jasmine.createSpy('setResult');
                });

                describe('unopposed', function() {
                    beforeEach(function() {
                        this.player2.clickPrompt('No');
                    });

                    it('should succeed the job', function() {
                        expect(this.jobAbility.setResult).toHaveBeenCalledWith(true, jasmine.any(Object));
                    });

                    it('should send dudes home booted', function() {
                        expect(this.tommy.booted).toBe(true);
                        expect(this.tommy.gamelocation).toBe(this.player1.player.outfit.uuid);
                        expect(this.jake.booted).toBe(true);
                        expect(this.jake.gamelocation).toBe(this.player1.player.outfit.uuid);
                    });
                });

                describe('when no opposing dudes are selected', function() {
                    beforeEach(function() {
                        this.player2.clickPrompt('Yes');
                        this.player2.clickPrompt('Done');
                    });

                    it('should give another chance to select dudes', function() {
                        expect(this.player2).toHavePromptButton('Done');
                    });                    

                    it('should succeed the job', function() {
                        this.player2.clickPrompt('Done');
                        expect(this.jobAbility.setResult).toHaveBeenCalledWith(true, jasmine.any(Object));
                    });

                    it('should send dudes home booted', function() {
                        this.player2.clickPrompt('Done');
                        expect(this.tommy.booted).toBe(true);
                        expect(this.tommy.gamelocation).toBe(this.player1.player.outfit.uuid);
                        expect(this.jake.booted).toBe(true);
                        expect(this.jake.gamelocation).toBe(this.player1.player.outfit.uuid);
                    });
                });

                describe('opposed', function() {
                    beforeEach(function() {
                        this.player2.clickPrompt('Yes');
                        this.player2.clickCard(this.barton, 'play area');
                        this.player2.clickPrompt('Done');
                    });

                    describe('posse empty in shootout plays', function() {
                        beforeEach(function() {
                            this.removeFromPosse(this.barton);
                            this.player1.clickPrompt('Pass');
                        });

                        it('should succeed the job', function() {
                            expect(this.jobAbility.setResult).toHaveBeenCalledWith(true, jasmine.any(Object));
                        });

                        it('should send dudes home booted', function() {
                            expect(this.tommy.booted).toBe(true);
                            expect(this.tommy.gamelocation).toBe(this.player1.player.outfit.uuid);
                            expect(this.jake.booted).toBe(true);
                            expect(this.jake.gamelocation).toBe(this.player1.player.outfit.uuid);
                        });
                    });

                    describe('posse running home', function() {
                        beforeEach(function() {
                            this.completeShootoutPlaysStep();
                            this.player1.clickCard(this.tommy, 'play area');
                            this.completeShootoutDrawStep();
                            this.completeShootoutResolutionStep();
                            this.completeTakeYerLumpsStep();
                        });

                        it('is leader\'s posse', function() {
                            this.eachPlayerInShootoutLoseWinOrder(player => {
                                if(player.name === this.player1.name) {
                                    player.clickPrompt('All dudes run');
                                } else {
                                    player.clickPrompt('Done');
                                }
                            });                           
                            expect(this.jobAbility.setResult).toHaveBeenCalledWith(false, jasmine.any(Object));
                        });

                        it('is mark\'s posse', function() {
                            this.eachPlayerInShootoutLoseWinOrder(player => {
                                if(player.name === this.player2.name) {
                                    player.clickPrompt('All dudes run');
                                } else {
                                    player.clickPrompt('Done');
                                }
                            });                           
                            expect(this.jobAbility.setResult).toHaveBeenCalledWith(true, jasmine.any(Object));
                            expect(this.tommy.booted).toBe(true);
                            expect(this.tommy.gamelocation).toBe(this.player1.player.outfit.uuid);
                            expect(this.jake.booted).toBe(true);
                            expect(this.jake.gamelocation).toBe(this.player1.player.outfit.uuid);
                        });
                    });
                });
            });
        });
    });
});
