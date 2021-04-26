const PlayerOrderPrompt = require('../playerorderprompt.js');

/* TODO M2
    Based on the rules, we should firt choose which dudes are aced, which discarded and which sent home (e.g. harrowed)
    Then, once chosen, all the casualties are taken based on the selection order.
    For now, each casualty will be taken right after the card is selected.
*/
class TakeYerLumpsPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder, numOfCasualties, source) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
        this.numOfCasualties = numOfCasualties;
        this.source = source;
        this.casualtiesTaken = [];
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

        this.game.promptWithMenu(this.currentPlayer, this, {
            activePrompt: {
                promptTitle: this.source ? this.source.title : 'Take Yer Lumps',
                menuTitle: 'Select casualty type (' + this.getCurrentCasualties() + ' remaining)',
                buttons: [
                    { text: 'Ace', method: 'coverCasualty', arg: 'ace' },
                    { text: 'Discard', method: 'coverCasualty', arg: 'discard' },
                    { text: 'Send Home', method: 'sendHomeCasualty' },
                    { text: 'Done', method: 'done' }
                ]
            }
        });

        return false;        
    }

    getCurrentCasualties() {
        if(this.numOfCasualties !== null && this.numOfCasualties !== undefined) {
            return this.numOfCasualties;
        }
        return this.currentPlayer.casualties;
    }

    isPossibleToCoverCasualties(player) {
        return player.cardsInPlay.some(card => this.canCoverCasualty(card, player, 'discard') || 
            this.canCoverCasualty(card, player, 'ace') || 
            this.canCoverCasualty(card, player, 'sendHome')
        );
    }

    canCoverCasualty(card, player, casualtyType) {
        return card.controller === player && 
            card.location === 'play area' &&
            this.shootout.isInShootout(card) &&
            card.allowGameAction(casualtyType, this.createContext(card, player)) &&
            !card.cannotBeChosenAsCasualty() &&
            card.coversCasualties(casualtyType) > 0;
    }

    coverCasualty(player, arg) {
        let firstCasualties = this.findFirstCasualties(player);
        if(firstCasualties.length > 1) {
            firstCasualties = [firstCasualties[0]];
        } 
        let title = 'Select card to ' + arg + ' to cover casualties';
        this.game.promptForSelect(player, {
            activePromptTitle: title,
            numCards: 1,
            mustSelect: firstCasualties,
            cardCondition: card => this.canCoverCasualty(card, player, arg),
            onSelect: (player, card) => {
                let numCoveredCasualties = 0;
                this.casualtiesTaken.push(card);
                if(arg === 'ace') {
                    numCoveredCasualties = card.coversCasualties('ace');
                    if(numCoveredCasualties > 0) {
                        player.aceCard(card, true, { isCasualty: true }, this.createContext(card, player));    
                    }         
                } else if(arg === 'discard') {
                    numCoveredCasualties = card.coversCasualties('discard');
                    if(numCoveredCasualties > 0) {
                        player.discardCard(card, true, { isCasualty: true }, this.createContext(card, player));
                    }
                }

                if(numCoveredCasualties > 0) {
                    this.modifyCasualties(player, card, numCoveredCasualties);
                    this.game.addMessage('{0} {1} {2} to cover {3} casualties ({4} remaining).', 
                        player, arg, card, numCoveredCasualties, player.casualties); 
                }
                return true;
            }
        });

        return true;
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
        if(this.numOfCasualties !== null && this.numOfCasualties !== undefined) {
            this.numOfCasualties -= numCoveredCasualties;
            if(this.numOfCasualties < 0) {
                this.numOfCasualties = 0;
            }
        } else {
            player.coverCasualties(numCoveredCasualties);
        }
        this.casualtiesTaken.push(card);
    }

    findFirstCasualties(player) {
        let posse = this.shootout.getPosseByPlayer(player);
        return posse.getDudes(dude => dude.isSelectedAsFirstCasualty());
    }

    done() {
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
