const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class VirgilEarp extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Cheatin\' Resolution: Virgil Earp',
            playType: ['cheatin resolution'],
            handler: context => {
                this.abilityContext = context;
                this.chosenBounty = [];
                this.maxBountyToChoose = context.player.isCheatin() ? 3 : 5;
                if(!this.isWantedDudeOpposing()) {
                    this.game.addMessage('{0} uses {1}, but it has no effect because there is ' +
                        'no wanted dude in the opposing posse', context.player, this);
                    return;
                }
                this.assignBountyChoices();
            }
        });
    }

    assignBountyChoices() {
        this.chosenBounty = [];
        this.currentBounties = this.maxBountyToChoose;
        this.chooseWantedDude();
        return true;
    }

    chooseWantedDude() {
        if(this.isWantedDudeOpposing()) {
            this.game.promptForSelect(this.abilityContext.player, {
                activePromptTitle: 'Select a dude with bounty',
                promptInfo: { type: 'info', message: `${this.currentBounties} bounties left` },
                waitingPromptTitle: 'Waiting for opponent to select bounty',
                cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.abilityContext.player &&
                        card.isWanted() &&
                        card.isParticipating() &&
                        !this.chosenBounty.some(bounty => bounty.dude === card),
                cardType: 'dude',
                additionalButtons: [{ text: 'Reset' }],
                onSelect: (player, wantedDude) => {
                    if(wantedDude.bounty === 1) {
                        this.chosenBounty.push({ dude: wantedDude, amount: 1 });
                        this.currentBounties -= 1;
                        if(this.currentBounties) {
                            this.chooseWantedDude(this.abilityContext);
                        } else {
                            this.virgilBountyHandler();
                        }
                    } else {
                        this.chosenBounty.unshift({ dude: wantedDude });
                        const buttons = [];
                        for(let index = 0; index <= Math.min(wantedDude.bounty, this.currentBounties); index++) {
                            buttons.push({ text: index, method: 'chooseBounty', arg: index });     
                        }
                        buttons.push({ text: 'Reset', method: 'assignBountyChoices'});
                        this.game.promptWithMenu(player, this, {
                            activePrompt: {
                                menuTitle: `How much bounty from ${wantedDude.title}?`,
                                promptInfo: { type: 'info', message: `${this.currentBounties} bounties left` },
                                buttons
                            },
                            source: this
                        });
                    }
                    return true;
                },
                onCancel: () => this.virgilBountyHandler(),
                onMenuCommand: () => this.assignBountyChoices(),
                source: this
            });
        } else {
            this.virgilBountyHandler(); 
        }
    }

    chooseBounty(player, arg) {
        const amount = parseInt(arg);
        if(amount === 0) {
            this.chosenBounty.shift();
            this.chooseWantedDude(this.abilityContext);
            return true;
        }
        this.chosenBounty[0].amount = amount;
        this.currentBounties -= amount;
        if(this.currentBounties) {
            this.chooseWantedDude(this.abilityContext);
        } else {
            this.virgilBountyHandler();
        }
        return true;
    }

    isWantedDudeOpposing() {
        const oppPosse = this.game.shootout.getPosseByPlayer(this.abilityContext.player.getOpponent());
        return oppPosse && oppPosse.findInPosse(dude => 
            dude.isWanted() && !this.chosenBounty.some(bounty => bounty.dude === dude));
    }

    virgilBountyHandler() {
        const opponent = this.abilityContext.player.getOpponent();
        const rankChange = this.currentBounties - this.maxBountyToChoose;
        opponent.modifyRank(rankChange);
        this.game.addMessage('{0} uses {1} and chooses bounties on {2} to lower {3}\'s rank by {4}; Current rank is {5}', 
            this.abilityContext.player, this, this.chosenBounty.map(bounty => bounty.dude), opponent, -1 * rankChange, opponent.getTotalRank());
        this.game.promptForYesNo(opponent, {
            title: 'Do you want to remove chosen bounty?',
            onYes: player => {
                this.chosenBounty.forEach(bounty => {
                    this.game.resolveGameAction(GameActions.removeBounty({ 
                        card: bounty.dude,
                        options: { amount: bounty.amount } 
                    }), this.abilityContext);
                });
                this.game.addMessage('{0} decides to remove bounties on {1} as a result of {2}\'s ability', 
                    player, this.chosenBounty.map(bounty => bounty.dude), this);
            },
            source: this
        });
    }
}

VirgilEarp.code = '22022';

module.exports = VirgilEarp;
