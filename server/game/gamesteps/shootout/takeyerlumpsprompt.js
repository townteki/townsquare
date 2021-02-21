const PlayerOrderPrompt = require('../playerorderprompt.js');

/* TODO M2
    Based on the rules, we should firt choose which dudes are aced, which discarded and which sent home (e.g. harrowed)
    Then, once chosen, all the casualties are taken based on the selection order.
    For now, each casualty will be taken right after the card is selected.
*/
class TakeYerLumpsPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if(this.isComplete()) {
            return true;
        }
        if(this.currentPlayer.casualties === 0 || this.shootout.getPosseByPlayer(this.currentPlayer).isEmpty()) {
            this.completePlayer();
            return this.continue();
        }

        this.game.promptWithMenu(this.currentPlayer, this, {
            activePrompt: {
                menuTitle: 'Select Yer Lumps to Take (' + this.currentPlayer.casualties + ' remaining)',
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

    coverCasualty(player, arg) {
        let title = 'Select card to ' + arg + ' to cover casualties';
        this.game.promptForSelect(player, {
            activePromptTitle: title,
            numCards: 1,
            cardCondition: card => card.controller === player && 
                card.location === 'play area' &&
                this.shootout.isInShootout(card) &&
                card.coversCasualties() > 0,
            onSelect: (player, card) => {
                let numCoveredCasualties = 0;
                if(arg === 'ace') {
                    numCoveredCasualties = card.coversCasualties('ace');
                    if(numCoveredCasualties > 0) {
                        player.aceCard(card, true, { isCasualty: true });    
                    }         
                } else if(arg === 'discard') {
                    numCoveredCasualties = card.coversCasualties('discard');
                    if(numCoveredCasualties > 0) {
                        player.discardCard(card, true, { isCasualty: true });
                    }
                }

                if(numCoveredCasualties > 0) {
                    player.coverCasualties(numCoveredCasualties);
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
            cardCondition: card => card.controller === player && 
                card.location === 'play area' &&
                this.shootout.isInShootout(card) &&
                card.coversCasualties('send') > 0,
            onSelect: (player, card) => {
                let numCoveredCasualties = card.coversCasualties('send');
                if(numCoveredCasualties > 0) {
                    this.shootout.sendHome(card, { isCardEffect: false });
                    player.coverCasualties(numCoveredCasualties);    
                    this.game.addMessage('{0} sends {1} home to cover {2} casualties ({3} remaining).', 
                        player, card, numCoveredCasualties, player.casualties);     
                }
                return true;
            }
        });

        return true;
    }

    done() {
        if(this.currentPlayer.casualties > 0) {
            this.game.addAlert('danger', '{0} ends `Take Yer Lumps` step with {1} casualties remaining!', this.currentPlayer, this.currentPlayer.casualties);
        }
        this.completePlayer();
        return true;
    }
}

module.exports = TakeYerLumpsPrompt;
