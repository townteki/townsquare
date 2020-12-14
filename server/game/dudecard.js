const _ = require('underscore');

const DrawCard = require('./drawcard.js');
const TradingPrompt = require('./gamesteps/highnoon/tradingprompt.js');
const {ShootoutStatuses, Tokens} = require('./Constants');

class DudeCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.maxWeapons = 1;
        this.maxHorses = 1;
        this.maxAttires = 1;

        this.currentBullets = this.cardData.bullets;
        this.currentInfluence = this.cardData.influence;
        this.currentControl = this.cardData.control;
        this.currentUpkeep = this.cardData.upkeep;

        this.shootoutStatus = ShootoutStatuses.None;
    }

    get bullets() {
        if (this.currentBullets < 0) {
            return 0;
        }
        return this.currentBullets;
    }

    set bullets(amount) {
        this.currentBullets = amount;
    }

    get shooter() {
        return this.studReferenceArray[0].shooter;
    }

    get influence() {
        if (this.currentInfluence < 0) {
            return 0;
        }
        return this.currentInfluence;
    }

    set influence(amount) {
        this.currentInfluence = amount;
    }

    get control() {
        return this.currentControl;
    }

    set control(amount) {
        this.currentControl = amount;
    }

    get upkeep() {
        if (this.currentUpkeep < 0) {
            return 0;
        }
        return this.currentUpkeep;
    }

    set upkeep(amount) {
        this.currentUpkeep = amount;
    }

    modifyBullets(amount, applying = true) {
        this.currentBullets += amount;

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardBulletsChanged', params);
    }

    setupCardAbilities(ability) {
        this.action({
            title: 'Call Out',
            abilitySourceType: 'game',
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
            abilitySourceType: 'game',
            condition: () => this.game.currentPhase === 'high noon' && this.hasAttachmentForTrading(),
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

    setupCardTextProperties(ability) {
        super.setupCardTextProperties(ability);
        this.studReferenceArray = [];
        this.studReferenceArray.unshift({ source: this.uuid, shooter: this.cardData.shooter});
    }

    createSnapshot() {
        let clone = new DudeCard(this.owner, this.cardData);
        clone = super.createSnapshot(clone);

        clone.maxWeapons = this.maxWeapons;
        clone.maxHorses = this.maxHorses;
        clone.maxAttires = this.maxAttires;
        clone.currentBullets = this.currentBullets;
        clone.currentInfluence = this.currentInfluence;
        clone.currentControl = this.currentControl;
        clone.currentUpkeep = this.currentUpkeep;
        clone.shootoutStatus = this.shootoutStatus;
        clone.studReferenceArray = this.studReferenceArray;

        return clone;
    }

    addStudEffect(source, shooterType) {
        this.studReferenceArray.unshift({ source: source, shooter: shooterType});
    }

    removeStudEffect(source) {
        this.studReferenceArray = this.studReferenceArray.filter(studRef => studRef.source !== source);
    }

    sendHome(booted = true, allowBooted = true) {
        this.owner.moveDude(this, this.owner.outfit.uuid, { needToBoot: booted, allowBooted: allowBooted });
    }

    moveToLocation(player, destinationUuid = '', playingType) {
        let origin = this.getLocation();
        if (origin) {
            origin.removeDude(this);
        }
        let destination = this.game.findLocation(playingType === 'shoppin' && destinationUuid === '' ? player.outfit.uuid : destinationUuid);
        if (destination) {
            destination.addDude(this);
        }
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
    
    get bounty() {
        return this.tokens[Tokens.bounty] || 0;
    }

    increaseBounty(amount = 1) {
        this.modifyToken(Tokens.bounty, amount);
    }

    decreaseBounty(amount = 1) {
        this.modifyToken(Tokens.bounty, amount * -1);
    }

    isWanted() {
        return this.tokens[Tokens.bounty] > 0;
    }

    isStud() {
        return this.studReferenceArray[0].shooter === 'Stud';
    }

    isDraw() {
        return this.studReferenceArray[0].shooter === 'Draw';
    }

    isHarrowed() {
        return this.hasKeyword('harrowed');
    }

    leavesPlay() {
        super.leavesPlay();

        if (this.game.shootout) {
            this.game.shootout.removeFromPosse(this);
        }
    }

    isParticipating() {
        return this.shootoutStatus != ShootoutStatuses.None;
    }

    getSummary(activePlayer) {
        let drawCardSummary = super.getSummary(activePlayer);

        let publicSummary = {
            shooter: this.shooter,
            shootoutStatus: this.shootoutStatus
        };

        if(drawCardSummary.facedown) {
            return Object.assign(drawCardSummary, publicSummary);
        }

        return Object.assign(drawCardSummary, publicSummary, {});
    }    
}

module.exports = DudeCard;
