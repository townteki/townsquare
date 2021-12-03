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
            this.game.promptWithMenu(this.currentPlayer, this, {
                activePrompt: {
                    promptTitle: this.source ? this.source.title : 'Take Yer Lumps',
                    promptInfo: { type: 'info', message: `Remaining: ${this.getCurrentCasualties()}`},
                    menuTitle: 'Select casualty type',
                    buttons: [
                        { text: 'Ace', method: 'selectCasualty', arg: 'ace' },
                        { text: 'Discard', method: 'selectCasualty', arg: 'discard' },
                        { text: 'Send Home', method: 'sendHomeCasualty' },
                        { text: 'Done', method: 'done' }
                    ]
                }
            });
        }

        return false;        
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
        return card.controller === player && 
            card.location === 'play area' &&
            this.shootout.isInShootout(card) &&
            card.coversCasualties(casualtyType, this.createContext(card, player)) > 0;
    }

    handleSolo(shootout) {
        let firstCasualty = this.findFirstCasualties(this.game.automaton).pop();
        const casualties = this.game.automaton.getCasualtiesResolution(shootout, this.getCurrentCasualties(), 
            firstCasualty, this.createContext(null, this.game.automaton));
        casualties.forEach(casualty => {
            this.coverCasualty(this.game.automaton, casualty.card, casualty.type);
        });
    }

    selectCasualty(player, arg) {
        let title = 'Select card to ' + arg + ' to cover casualties';
        this.game.promptForSelect(player, {
            activePromptTitle: title,
            numCards: 1,
            mustSelect: this.findFirstCasualties(player),
            cardCondition: card => this.canCoverCasualty(card, player, arg),
            onSelect: (player, card) => {
                this.coverCasualty(player, card, arg);

                return true;
            }
        });

        return true;
    }

    coverCasualty(player, card, type) {
        let numCoveredCasualties = 0;
        this.casualtiesTaken.push(card);
        if(type === 'ace') {
            numCoveredCasualties = card.coversCasualties('ace');
            if(numCoveredCasualties > 0) {
                player.aceCard(card, true, { isCasualty: true }, this.createContext(card, player));    
            }         
        } else if(type === 'discard') {
            numCoveredCasualties = card.coversCasualties('discard');
            if(numCoveredCasualties > 0) {
                player.discardCard(card, true, { isCasualty: true }, this.createContext(card, player));
            }
        }

        if(numCoveredCasualties > 0) {
            this.modifyCasualties(player, card, numCoveredCasualties);
            this.game.addMessage('{0} {1} {2} to cover {3} casualties ({4} remaining).', 
                player, type, card, numCoveredCasualties, player.casualties); 
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
        const firstCasualties = posse.getDudes(dude => dude.isSelectedAsFirstCasualty());
        if(firstCasualties.length > 1) {
            return firstCasualties.slice(0, 1);
        }
        return firstCasualties || [];
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
