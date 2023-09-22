const PlayerOrderPrompt = require('../playerorderprompt.js');

/* TODO M2
    Based on the rules, we should firt choose which dudes are aced, which discarded and which sent home (e.g. harrowed)
    Then, once chosen, all the casualties are taken based on the selection order.
    For now, each casualty will be taken right after the card is selected.
*/
class TakeYerLumpsPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder, source) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
        this.source = source;
        this.casualtiesTaken = [];
        this.firstCasualtySelected = false;
        this.firstCasualty = null;
    } 

    continue() {
        if(this.isComplete()) {
            return true;
        }
        if(this.getCurrentCasualties() === 0 || this.shootout.getPosseByPlayer(this.currentPlayer).isEmpty()) {
            this.completePlayer();
            return this.continue();            
        }
        if(!this.isPossibleToCoverCasualties(this.currentPlayer)) {
            this.game.addAlert('info', '{0} could not cover {1} casualties because of other effects', this.currentPlayer, this.getCurrentCasualties());
            this.completePlayer();
            return this.continue();            
        }

        if(this.currentPlayer === this.game.automaton) {
            this.handleSolo(this.shootout);
        } else {
            let firstCasualties = [];
            if(!this.firstCasualtySelected) {
                firstCasualties = this.findFirstCasualties(this.currentPlayer);
            }
            if(firstCasualties.length) {
                this.game.promptForSelect(this.currentPlayer, {
                    activePromptTitle: 'Select first casualty',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller === this.currentPlayer && firstCasualties.includes(card),
                    onSelect: (player, card) => {
                        this.firstCasualty = card;
                        this.selectCasualtyType();
                        return true;
                    },
                    source: this
                });
            } else {
                this.firstCasualty = null;
                this.firstCasualtySelected = true;
                this.selectCasualtyType();
            }
        }

        return false;        
    }

    selectCasualtyType() {
        const controls = this.firstCasualty ? [{ type: 'card-image', source: this.firstCasualty.getShortSummary() }] : [];
        this.game.promptWithMenu(this.currentPlayer, this, {
            activePrompt: {
                promptTitle: this.source ? this.source.title : 'Take Yer Lumps',
                promptInfo: { type: 'info', message: `Remaining: ${this.getCurrentCasualties()}`},
                menuTitle: `Select casualty type${this.firstCasualty ? ' for' : ''}`,
                controls,
                buttons: [
                    { 
                        text: 'Ace', 
                        method: 'selectCasualty', 
                        arg: 'ace',
                        disabled: this.firstCasualty && !this.canCoverCasualty(this.firstCasualty, this.currentPlayer, 'ace')
                    },
                    { 
                        text: 'Discard', 
                        method: 'selectCasualty', 
                        arg: 'discard',
                        disabled: this.firstCasualty && !this.canCoverCasualty(this.firstCasualty, this.currentPlayer, 'discard')
                    },
                    { 
                        text: 'Send Home', 
                        method: 'sendHomeCasualty',
                        disabled: this.firstCasualty && !this.canCoverCasualty(this.firstCasualty, this.currentPlayer, 'sendHome')
                    },
                    { 
                        text: 'Done', 
                        method: 'done' 
                    }
                ]
            }
        });
    }

    getCurrentCasualties() {
        return this.currentPlayer.casualties;
    }

    isPossibleToCoverCasualties(player) {
        return player.cardsInPlay.some(card => this.canCoverCasualty(card, player, 'discard') || 
            this.canCoverCasualty(card, player, 'ace') || 
            this.canCoverCasualty(card, player, 'sendHome')
        );
    }

    canCoverCasualty(card, player, casualtyType) {
        return card.controller.equals(player) && 
            card.location === 'play area' &&
            this.shootout.isInShootout(card) &&
            card.coversCasualties(casualtyType, this.createContext(card, player)) > 0;
    }

    validateCasualty(player, card, type, isFirstCasualty = false) {
        const context = this.createContext(card, player);
        const casualtyContext = this.getCasualtyContext(this.shootout, player);
        const numToCover = card.coversCasualties(type, context);
        const maxToCover = card.coversCasualties('any', context);
        const newCasualtiesToCover = casualtyContext.currentCasualtiesNum - numToCover;
        const newMaxCasualties = casualtyContext.maxPossibleCasualties - maxToCover;
        if(newCasualtiesToCover < 0 || (newMaxCasualties < newCasualtiesToCover && numToCover < maxToCover)) {
            let title = newCasualtiesToCover < 0 ? 'Selected casualty will cover more than required. Do you want to continue?' :
                'Selected casualty will not cover required number. Do you want to continue?';
            this.game.promptForYesNo(player, {
                title,
                onYes: player => {
                    this.coverCasualty(player, card, type);
                    if(isFirstCasualty) {
                        this.firstCasualty = null;
                        this.firstCasualtySelected = true;
                    }
                    const casualtyTypeText = type === 'sendHome' ? 'sends home' : type + 's';
                    if(newCasualtiesToCover < 0) {
                        this.game.addAlert('danger', '{0} {1} {2} as a casualty; This is more casualties ({3}) than required ({4})!',
                            player, casualtyTypeText, card, numToCover, -1 * newCasualtiesToCover);
                    } else {
                        this.game.addAlert('danger', '{0} {1} {2} as a casualty; This is not enough to cover remaining casualties!',
                            player, casualtyTypeText, card);                   
                    }
                }
            });
        } else {
            this.coverCasualty(player, card, type);
        }
    }

    getCasualtyContext(shootout, player) {
        const casualtyContext = {
            currentCasualtiesNum: this.getCurrentCasualties(), 
            maxPossibleCasualties: 0
        };
        const context = this.createContext(null, player);
        casualtyContext.availableVictims = shootout.getPosseByPlayer(player).getCards(card => {
            context.casualty = card;
            let casualtyNum = card.coversCasualties('any', context);
            if(casualtyNum) {
                casualtyContext.maxPossibleCasualties += casualtyNum;
                return true;
            }
            return false;
        });
        return casualtyContext; 
    }

    handleSolo(shootout) {
        let firstCasualty = this.findFirstCasualties(this.game.automaton).pop();
        let casualtyContext = this.getCasualtyContext(shootout, this.game.automaton);
        const casualties = this.game.automaton.getCasualties(casualtyContext, firstCasualty);
        casualties.forEach(casualty => {
            this.coverCasualty(this.game.automaton, casualty.card, casualty.type);
        });
    }

    selectCasualty(player, arg) {
        if(this.firstCasualty) {
            this.validateCasualty(player, this.firstCasualty, arg, true);
        } else {
            let title = 'Select card to ' + arg + ' to cover casualties';
            this.game.promptForSelect(player, {
                activePromptTitle: title,
                numCards: 1,
                cardCondition: card => this.canCoverCasualty(card, player, arg),
                onSelect: (player, card) => {
                    this.validateCasualty(player, card, arg);
                    return true;
                }
            });
        }

        return true;
    }

    coverCasualty(player, card, type) {
        this.game.raiseEvent('onCasualtyChosen', { 
            player, 
            shootout: this.shootout, 
            card,
            type
        });        
        let numCoveredCasualties = 0;
        if(type === 'ace') {
            numCoveredCasualties = card.coversCasualties('ace');
            if(numCoveredCasualties > 0) {
                player.aceCard(card, { isCasualty: true }, this.createContext(card, player));    
            }         
        } else if(type === 'discard') {
            numCoveredCasualties = card.coversCasualties('discard');
            if(numCoveredCasualties > 0) {
                player.discardCard(card, { isCasualty: true }, this.createContext(card, player));
            }
        }

        if(numCoveredCasualties > 0) {
            this.modifyCasualties(player, card, numCoveredCasualties);
            this.game.addMessage('{0} {1} {2} to cover {3} casualties ({4} remaining).', 
                player, type + 's', card, numCoveredCasualties, player.casualties); 
        }
    }

    sendHomeCasualty(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select card to send home to cover casualties',
            numCards: 1,
            cardCondition: card => this.canCoverCasualty(card, player, 'sendHome'),
            onSelect: (player, card) => {
                let numCoveredCasualties = card.coversCasualties('sendHome');
                if(numCoveredCasualties > 0) {
                    this.shootout.sendHome(card, this.createContext(card, player), { isCardEffect: false });
                    this.modifyCasualties(player, card, numCoveredCasualties);    
                    this.game.addMessage('{0} sends {1} home to cover {2} casualties ({3} remaining).', 
                        player, card, numCoveredCasualties, player.casualties);     
                }
                return true;
            }
        });

        return true;
    }

    modifyCasualties(player, card, numCoveredCasualties) {
        player.coverCasualties(numCoveredCasualties);
        this.casualtiesTaken.push(card);
    }

    findFirstCasualties(player) {
        let posse = this.shootout.getPosseByPlayer(player);
        return posse.getDudes(dude => dude.isSelectedAsFirstCasualty()) || [];
    }

    done() {
        if(!this.firstCasualtySelected) {
            return true;
        }
        if(this.currentPlayer.casualties > 0) {
            this.game.addAlert('danger', '{0} ends `Take Yer Lumps` step with {1} casualties remaining!', this.currentPlayer, this.currentPlayer.casualties);
        }
        this.completePlayer();
        return true;
    }

    completePlayer() {
        this.game.raiseEvent('onTakenCasualties', { 
            player: this.currentPlayer, 
            shootout: this.shootout, 
            casualtiesTaken: this.casualtiesTaken 
        });
        super.completePlayer();
    }

    createContext(card, player) {
        return {
            game: this.game,
            shootout: this.shootout,
            player: player,
            source: this.source,
            casualty: card,
            isCasualty: true
        };
    }
}

module.exports = TakeYerLumpsPrompt;
