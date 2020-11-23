const _ = require('underscore');

const DrawCard = require('./drawcard.js');
const TradingPrompt = require('./gamesteps/highnoon/tradingprompt.js');
const {ShootoutStatuses} = require('./Constants');

class DudeCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.maxWeapons = 1;
        this.maxHorses = 1;
        this.maxAttires = 1;

        this.shootoutStatus = ShootoutStatuses.None;
    }

    setupCardAbilities(ability) {
        this.action({
            title: 'Call Out',
            condition: () => this.game.currentPhase === 'high noon' && !this.booted,
            target: {
                activePromptTitle: 'Select dude to call out',
                cardCondition: card => card.getType() === 'dude' && 
                    card.gamelocation === this.gamelocation &&
                    card.uuid !== this.uuid &&
                    card.controller !== this.controller,
                autoSelect: false
            },
            targetController: 'opponent',
            handler: context => {
                this.shootoutStatus = ShootoutStatuses.CallingOut;
                context.target.shootoutStatus = ShootoutStatuses.CalledOut;
                if (!context.target.booted) {
                    this.game.promptWithMenu(context.target.controller, this, {
                        activePrompt: {
                            menuTitle: this.title + ' is calling out ' + context.target.title,
                            buttons: [
                                { text: 'Accept Callout', method: 'acceptCallout', arg: context.target.uuid },
                                { text: 'Run like hell', method: 'rejectCallout', arg: context.target.uuid }
                            ]
                        },
                        waitingPromptTitle: 'Waiting for opponent to decide if he runs or fights'
                    });
                } else {
                    this.acceptCallout(context.target.controller, context.target.uuid);
                }
            },
            player: this.owner
        });

        this.action({
            title: 'Trade',
            condition: () => this.game.currentPhase === 'high noon' && this.hasAttachment(true),
            target: {
                activePromptTitle: 'Select attachment(s) to trade',
                multiSelect: true,
                numCards: 0,
                cardCondition: card => card.getType() === 'goods' && 
                    card.parent == this &&
                    !card.wasTraded()
            },
            targetController: 'current',
            handler: context => {
                this.game.queueStep(new TradingPrompt(this.game, context.player, context.target));
            },
            player: this.owner
        });        
    }

    sendHome(booted = true, allowBooted = true) {
        this.owner.moveDude(this, this.owner.outfit.uuid, { needToBoot: booted, allowBooted: allowBooted });
    }

    canAttachWeapon(weapon) {
        let weapons = this.getAttachmentsByKeywords([ 'weapon' ]);
        if (weapons && weapons.length >= this.maxWeapons) {
            return false;
        }
        return true;
    }

    canAttachHorse(horse) {
        let horses = this.getAttachmentsByKeywords([ 'horse' ]);
        if (horses && horses.length >= this.maxHorses) {
            return false;
        }
        return true;
    }

    canAtachAttire(attire) {
        let attires = this.getAttachmentsByKeywords([ 'attire' ]);
        if (attires && attires.length >= this.maxAttires) {
            return false;
        }
        return true;
    }

    acceptCallout(player, targetUuid) {
        let targetDude = player.findCardInPlayByUuid(targetUuid);
        this.game.startShootout(this, targetDude);
        this.game.addMessage('{0} uses {1} to call out {2} who accepts.', this.owner, this, targetDude);
        return true;
    }

    rejectCallout(player, targetUuid) {
        let targetDude = player.findCardInPlayByUuid(targetUuid);
        this.shootoutStatus = ShootoutStatuses.None;
        targetDude.shootoutStatus = ShootoutStatuses.None;
        targetDude.sendHome();
        this.game.addMessage('{0} uses {1} to call out {2} who runs home to mama.', this.owner, this, targetDude);
        return true;
    }

    canJoinPosse(isJob = false, allowBooted = false) {
        let shootout = this.game.shootout;
        if (this.gamelocation === shootout.mark.gamelocation) {
            return true;
        }  
        if (this.getLocation().isAdjacent(shootout.mark.gamelocation) && (!this.booted || allowBooted)) {
            return true;
        }

        if (isJob && shootout.belongsToLeaderPlayer(this) && (!this.booted || allowBooted)) {
            if (this.gamelocation === shootout.leader.gamelocation) {
                return true;
            } 
            if (this.getLocation.isAdjacent(shootout.leader.gamelocation)) {
                return true;
            }         
        }

        return false;
    }

    moveToShootoutLocation(needToBoot = true, allowBooted = false) {
        let shootout = this.game.shootout;
        if (this.gamelocation === shootout.mark.gamelocation) {
            return;
        }
        if (shootout.isJob()) {
            // if this shootout is a Job, all dudes that had to be booted should already be booted.
            needToBoot = false;
        }
        this.controller.moveDude(this, shootout.mark.gamelocation, { needToBoot: needToBoot, allowBooted: allowBooted });
    }

    getSummary(activePlayer) {
        let drawCardSummary = super.getSummary(activePlayer);

        let publicSummary = {
            shootoutStatus: this.shootoutStatus
        };

        if(drawCardSummary.facedown) {
            return Object.assign(drawCardSummary, publicSummary);
        }

        return Object.assign(drawCardSummary, publicSummary, {});
    }    
}

module.exports = DudeCard;
