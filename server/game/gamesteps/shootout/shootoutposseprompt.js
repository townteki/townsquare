const GameActions = require('../../GameActions/index.js');
const UiPrompt = require('../uiprompt.js');

class ShootoutPossePrompt extends UiPrompt {
    constructor(game, shootout, player) {
        super(game);
        this.shootout = shootout;
        this.player = player;
        this.activePromptTitle = 'Select dudes to join posse';
    }  

    continue() {
        if(!this.isComplete()) {
            if(this.player.otherDudesCannotJoin()) {
                this.joinLeaderAndMark(this.player);
                this.complete(); 
            } else {
                if(!this.player.equals(this.game.automaton)) {
                    this.handleDefaultJoin();
                } else {
                    this.handleSolo();
                }
            }
        }
        return this.isComplete();
    }

    handleDefaultJoin() {
        const additionalButtons = [];
        if(this.shootout.isJob() && this.shootout.options.jobAbility.posseCondition) {
            additionalButtons.push({ text: 'Cancel', arg: 'cancel' });
        }
        this.game.promptForSelect(this.player, {
            activePromptTitle: this.activePromptTitle,
            multiSelect: true,
            numCards: 0,
            isCardEffect: false,
            additionalButtons: additionalButtons,
            cardCondition: card => card.getType() === 'dude' && 
                card.location === 'play area' &&
                card.controller.equals(this.player) &&
                (!card.equals(this.shootout.mark) || this.shootout.isJob()) &&
                !card.equals(this.shootout.leader) &&
                !card.isParticipating() &&
                card.requirementsToJoinPosse().canJoin &&
                !card.cannotJoinPosse(this.shootout.getPosseByPlayer(this.player)),
            onSelect: (player, dudeSelection) => {
                this.formPosse(player, dudeSelection);
                return true;
            },
            onCancel: (player) => {
                if(player.equals(this.shootout.leaderPlayer) && !this.passesJobCondition()) {
                    return true;
                }
                if(this.shootout.isJob() && this.shootout.opposingPlayer === player) {
                    this.shootout.endShootout();
                } else {
                    this.joinLeaderAndMark(player);
                }
                this.complete();
                return true;
            },
            onMenuCommand: () => {
                this.shootout.cancelled = true;
                this.complete();
                return true;
            },
            source: this.shootout.isJob() ? this.shootout.options.jobAbility.card : undefined
        });
    }

    handleSolo() {
        this.formPosse(this.player, this.player.getDudesToFormPosse(this.shootout));
    }

    formPosse(player, dudes) {
        if(player.equals(this.shootout.leaderPlayer) && !this.passesJobCondition(dudes)) {
            return true;
        }
        this.joinLeaderAndMark(player);
        //Do not move to posse yet, it will be done once both posses are selected (Shootout.gatherPosses())
        dudes.forEach(dude => 
            this.game.resolveGameAction(GameActions.joinPosse({ 
                card: dude, 
                options: { 
                    isCardEffect: false, 
                    moveToPosse: false,
                    doNotPutBounty: true
                } 
            }))
        );
        if(player.equals(this.shootout.leaderPlayer)) {
            this.game.raiseEvent('onLeaderPosseFormed', { shootout: this.shootout });
            this.game.addMessage('{0} with {1} as leader forms their posse including dudes: {2}', player, this.shootout.leader, dudes);
        } else {
            if(!this.shootout.isJob()) {
                this.game.addMessage('{0} with {1} as mark forms their posse including dudes: {2}', player, this.shootout.mark, dudes);   
            } else {
                this.game.addMessage('{0} is opposing a job marking {1} and forms their posse including dudes: {2}', player, this.shootout.mark, dudes); 
            }
        }                 
        this.complete();    
    }

    joinLeaderAndMark(player) {
        //Leader and mark (if not job because in job mark does not have to be in posse) join posses first.
        if(player.equals(this.shootout.leaderPlayer)) {
            this.game.resolveGameAction(GameActions.joinPosse({ 
                card: this.shootout.leader, 
                options: { 
                    isCardEffect: false, 
                    moveToPosse: false,
                    doNotPutBounty: true
                } 
            }));
        } else if(!this.shootout.isJob()) {
            this.game.resolveGameAction(GameActions.joinPosse({ 
                card: this.shootout.mark, 
                options: { 
                    isCardEffect: false, 
                    moveToPosse: false,
                    doNotPutBounty: true
                } 
            }));
        }
    }

    passesJobCondition(dudeSelection = []) {
        if(!this.shootout.isJob() || !this.shootout.options.jobAbility ||
            !this.shootout.options.jobAbility.posseCondition) {
            return true;
        }
        if(this.shootout.options.jobAbility.posseCondition(this.shootout, dudeSelection)) {
            this.game.markActionAsTaken(this.shootout.options.jobAbility.context);
            return true;
        } 
        this.activePromptTitle = 'Your posse does not pass Job condition! Select dudes to join posse';
        return false;
    }
}

module.exports = ShootoutPossePrompt;
