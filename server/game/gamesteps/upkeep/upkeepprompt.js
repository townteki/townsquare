const PlayerOrderPrompt = require('../playerorderprompt.js');

class UpkeepPrompt extends PlayerOrderPrompt {
    constructor(game) {
        super(game);
        this.title = 'Select Dudes to fire' ;
        this.selectedCards = [];
        this.firstUpkeepMessage = true;
    }

    activeCondition(player) {
        return super.activeCondition(player) && 
            !player.upkeepPaid && this.getDudesWithUpkeep(player).length > 0;
    }

    skipCondition(player) {
        return player.upkeepPaid || this.getDudesWithUpkeep(player).length === 0;
    }

    activePrompt(player) {
        let requiredGR = this.getRequiredUpkeep(player);
        let promptInfo = requiredGR > 0 ? { type: 'danger', message: `${requiredGR} GR missing`} : {};
        return {
            promptTitle: 'Payday',
            menuTitle: this.title,
            promptInfo,
            buttons: [
                { arg: 'selected', text: 'Done' }
            ],
            selectCard: true
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to pay upkeep' };
    }

    continue() {
        if(this.firstUpkeepMessage && this.getDudesWithUpkeep(this.currentPlayer).length === 0) {
            this.game.addMessage('{0} does not pay any upkeep', this.currentPlayer);
            this.firstUpkeepMessage = false;
        }
        if(this.isComplete()) {
            return true;
        }
        this.highlightSelectableCards(this.currentPlayer);

        return super.continue();
    }

    onCardClicked(player, card) {
        if(card.controller !== player || card.location !== 'play area' ||
            card.getType() !== 'dude' || card.upkeep === 0) {
            return false;
        }

        if(!this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
        } else {
            this.selectedCards = this.selectedCards.filter(selectedCard => selectedCard !== card);
        }
        player.setSelectedCards(this.selectedCards);
    }

    highlightSelectableCards(player) {
        player.selectCard = true;
        player.setSelectableCards(this.getDudesWithUpkeep(player));
    }

    onMenuCommand(player, arg) {
        if(arg === 'manualForAutomaton') {
            player = this.game.automaton;
        }
        let upkeep = player.determineUpkeep(this.selectedCards);
        let difference = this.getRequiredUpkeep(player, upkeep);
        if(difference > 0) {
            return false;
        }
        if(this.selectedCards.length) {
            this.discardCards(player, this.selectedCards, () => {
                this.payUpkeepAndComplete(player, upkeep);
            });
        } else {
            this.payUpkeepAndComplete(player, upkeep);
        }
        return true;
    }

    payUpkeepAndComplete(player, upkeep) {
        if(upkeep === 0) {
            this.game.addMessage('{0} does not pay any upkeep', this.currentPlayer);
        } else {
            player.payUpkeep(upkeep);
            this.game.addMessage('{0} has paid upkeep of {1} GR', player, upkeep);
        }
        this.firstUpkeepMessage = false;
        this.selectedCards = [];
        player.clearSelectedCards();
        player.clearSelectableCards();
        super.completePlayer(player);
    }

    discardCards(player, cards, callback) {
        if(cards.length > 0) {
            player.discardCards(cards, false, callback, { isUpkeep: true });
            this.game.addMessage('{0} discards {1} so that they do not have to pay upkeep for them', player, cards);
        }
    }

    getRequiredUpkeep(player, upkeep) {
        let totalUpkeep = upkeep || player.determineUpkeep(this.selectedCards);
        const difference = totalUpkeep - player.ghostrock;
        return difference < 0 ? 0 : difference;
    }

    getDudesWithUpkeep(player) {
        return player.cardsInPlay.filter(card => card.getType() === 'dude' && card.upkeep);
    }

    handleSolo() {
        const requiredUpkeep = this.getRequiredUpkeep(this.game.automaton);
        if(requiredUpkeep > 0) {
            const orderedTargets = this.game.automaton.orderByTargetPriority(this.getDudesWithUpkeep(this.game.automaton), 'discard');
            this.selectedCards = [];
            let freedUpkeep = 0;
            for(let dude in orderedTargets) {
                if(freedUpkeep < requiredUpkeep) {
                    this.selectedCards.push(dude);
                    freedUpkeep += dude.upkeep;
                } else {
                    break;
                }
            }
        }
        if(!this.onMenuCommand(this.game.automaton)) {
            this.game.addAlert('warn', '{0} could not pay the upkeep, please resolve manually', this.currentPlayer);
            this.game.promptWithMenu(this.game.automaton.getOpponent(), this, {
                activePrompt: {
                    menuTitle: `Resolve upkeep for ${this.game.automaton.name} manually`,
                    buttons: [
                        { text: 'Done', method: 'onMenuCommand', arg: 'manualForAutomaton' }
                    ]
                },
                source: this
            });
        }
    }

    canHandleSolo() {
        return super.canHandleSolo() && this.currentPlayer === this.game.automaton;
    }
}

module.exports = UpkeepPrompt;
