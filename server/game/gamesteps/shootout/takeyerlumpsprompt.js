const PlayerOrderPrompt = require('../playerorderprompt.js');

/* TODO M2
    Based on the rules, we should firt choose which dudes are aced, which discarded and which sent home (e.g. harrowed)
    Then, once chosen, all the casaulties are taken based on the selection order.
    For now, each casaulty will be taken right after the card is selected.
*/
class TakeYerLumpsPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if (this.isComplete()) {
            return true;
        }
        if (this.currentPlayer.handResult.casaulties == 0 || this.shootout.getPosseByPlayer(this.currentPlayer).isEmpty()) {
            this.completePlayer();
            return this.continue();
        }

        this.game.promptWithMenu(this.currentPlayer, this, {
            activePrompt: {
                menuTitle: 'Select Yer Lumps to Take (' + this.currentPlayer.handResult.casaulties + ' remaining)',
                buttons: [
                    { text: 'Ace', method: 'coverCasaulty', arg: 'ace' },
                    { text: 'Discard', method: 'coverCasaulty', arg: 'discard' },
                    { text: 'Send Home', method: 'sendHomeCasaulty' },
                    { text: 'Done', method: 'done' }
                ]
            }
        });

        return false;        
    }

    coverCasaulty(player, arg) {
        let title = 'Select card to ' + arg + ' to cover casaulties';
        this.game.promptForSelect(player, {
            activePromptTitle: title,
            numCards: 1,
            cardCondition: card => card.controller === player && 
                card.location === 'play area' &&
                this.shootout.isInShootout(card) &&
                card.coversCasaulties() > 0,
            onSelect: (player, card) => {
                let numCoveredCasaulties = 0;
                if (arg === 'ace') {
                    numCoveredCasaulties = card.coversCasaulties('ace');
                    if (numCoveredCasaulties > 0) {
                        player.aceCard(card);     
                    }         
                } else if (arg === 'discard') {
                    numCoveredCasaulties = card.coversCasaulties('discard');
                    if (numCoveredCasaulties > 0) {
                        player.discardCard(card);
                    }
                }
                player.handResult.coverCasaulties(numCoveredCasaulties);
                return true;
            }
        });

        return true;
    }

    sendHomeCasaulty(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select card to send home to cover casaulties',
            numCards: 1,
            cardCondition: card => card.controller === player && 
                card.location === 'play area' &&
                this.shootout.isInShootout(card) &&
                card.coversCasaulties('send') > 0,
            onSelect: (player, card) => {
                let numCoveredCasaulties = card.coversCasaulties('send');
                if (numCoveredCasaulties > 0) {
                    card.sendHome();
                    player.handResult.coverCasaulties(numCoveredCasaulties);         
                }
                return true;
            }
        });

        return true;
    }

    done() {
        if (this.currentPlayer.handResult.casaulties > 0) {
            this.game.addAlert('danger', '{0} ends \`Take Yer Lumps\` step with {1} casaulties remaining!', this.currentPlayer, this.currentPlayer.handResult.casaulties);
        }
        this.completePlayer();
        return true;
    }

}

module.exports = TakeYerLumpsPrompt;
