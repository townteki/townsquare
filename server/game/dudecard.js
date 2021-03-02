const _ = require('underscore');

const DrawCard = require('./drawcard.js');
const TradingPrompt = require('./gamesteps/highnoon/tradingprompt.js');
const GameActions = require('./GameActions');
const {ShootoutStatuses, Tokens} = require('./Constants');

class DudeCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.maxWeapons = 1;
        this.maxHorses = 1;
        this.maxAttires = 1;
        this.maxBullets = null;

        this.currentUpkeep = this.cardData.upkeep;

        this.shootoutStatus = ShootoutStatuses.None;
        this.controlDeterminator = 'influence:deed';
        this.studReferenceArray = [];
        this.studReferenceArray.unshift({ source: this.uuid, shooter: this.cardData.shooter});
        this.spellFunc = spell => spell.parent === this;
        this.setupDudeCardAbilities();
    }

    get bullets() {
        let tempBullets = super.bullets;
        if(this.maxBullets && this.maxBullets < tempBullets) {
            return this.maxBullets;
        }
        return tempBullets;
    }

    get shooter() {
        return this.studReferenceArray[0].shooter;
    }

    get upkeep() {
        if(this.currentUpkeep < 0) {
            return 0;
        }
        return this.currentUpkeep;
    }

    set upkeep(amount) {
        this.currentUpkeep = amount;
    }

    getStat(statName) {
        switch(statName) {
            // TODO M2 need to separate general influence and influence for controling deeds
            case 'influence': 
            case 'influence:deed': 
                return this.influence;
            case 'bullets':
                return this.bullets;
        }
    }

    getSkillRating(skillName) {
        return this.keywords.getSkillRating(skillName);
    }

    getSkillRatingForCard(spellOrGadget) {
        if(spellOrGadget.isMiracle()) {
            return this.getSkillRating('blessed');
        }
        if(spellOrGadget.isHex()) {
            return this.getSkillRating('huckster');
        }
        if(spellOrGadget.isSpirit() || spellOrGadget.isTotem()) {
            return this.getSkillRating('shaman');
        }
        if(spellOrGadget.isGadget()) {
            return this.getSkillRating('mad scientist');
        }
    }

    modifyUpkeep(amount, applying = true) {
        this.currentUpkeep += amount;

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardUpkeepChanged', params);
    }

    setupDudeCardAbilities() {
        this.action({
            title: 'Call Out',
            abilitySourceType: 'game',
            condition: () => this.game.currentPhase === 'high noon' && !this.booted,
            target: {
                activePromptTitle: 'Select dude to call out',
                cardCondition: card => card.getType() === 'dude' && this.gamelocation &&
                    card.gamelocation === this.gamelocation &&
                    !this.getGameLocation().isHome(card.controller) &&
                    card.uuid !== this.uuid &&
                    card.controller !== this.controller,
                autoSelect: false,
                gameAction: 'callout'
            },
            targetController: 'opponent',
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ caller: this, callee: context.target, isCardEffect: false }), context);
            },
            player: this.controller
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
                    card.parent === this &&
                    !card.wasTraded()
            },
            targetController: 'current',
            handler: context => {
                this.game.queueStep(new TradingPrompt(this.game, context.player, context.target));
            },
            player: this.controller
        });        
    }

    createSnapshot(clone, cloneBaseAttributes = true) {
        if(!clone) {
            clone = new DudeCard(this.owner, this.cardData);
        }
        clone = super.createSnapshot(clone, cloneBaseAttributes);

        clone.maxWeapons = this.maxWeapons;
        clone.maxHorses = this.maxHorses;
        clone.maxAttires = this.maxAttires;
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

    sendHome(options = {}) {
        this.owner.moveDude(this, this.owner.outfit.uuid, options);
    }

    moveToLocation(destinationUuid) {
        let origin = this.getGameLocation();
        if(origin) {
            origin.removeDude(this);
        }
        let destination = this.game.findLocation(destinationUuid);
        if(destination) {
            destination.addDude(this);
        }
    }

    upgrade(expDude) {
        expDude.controller.moveCard(expDude, 'play area', { raiseEvents: false });
        expDude = this.createSnapshot(expDude, false);

        expDude.currentValue = this.currentValue - this.getPrintedStat('value') + expDude.getPrintedStat('value');
        expDude.currentBullets = this.currentBullets - this.getPrintedStat('bullets') + expDude.getPrintedStat('bullets');
        expDude.currentInfluence = this.currentInfluence - this.getPrintedStat('influence') + expDude.getPrintedStat('influence');
        expDude.currentControl = this.currentControl - this.getPrintedStat('control') + expDude.getPrintedStat('control');
        expDude.currentUpkeep = this.currentUpkeep - this.getPrintedStat('upkeep') + expDude.getPrintedStat('upkeep');
        expDude.currentProduction = this.currentProduction - this.getPrintedStat('production') + expDude.getPrintedStat('production');

        if(this.keywords.data) {
            this.keywords.getValues().forEach(keyword => {
                for(let i = 1; i < this.keyword.getValue(keyword); i++) {
                    expDude.keywords.add(keyword);
                }
            });
        }
        Object.keys(this.keywords.modifiers).forEach(keywordMod => 
            expDude.keywords.modifiers[keywordMod].modifier = this.keywords.modifiers[keywordMod].modifier);

        expDude.attachments = _([]);
        this.attachments.each(attachment => {
            expDude.controller.attach(attachment, expDude, 'upgrade');
        });

        this.controller.moveCard(this, 'discard pile', { raiseEvents: false });
    }

    callOut(card, canReject = true) {
        this.shootoutStatus = ShootoutStatuses.CallingOut;
        card.shootoutStatus = ShootoutStatuses.CalledOut;
        if(!card.booted && canReject) {
            this.game.promptWithMenu(card.controller, this, {
                activePrompt: {
                    menuTitle: this.title + ' is calling out ' + card.title,
                    buttons: [
                        { text: 'Accept Callout', method: 'acceptCallout', arg: card.uuid },
                        { text: 'Run like hell', method: 'rejectCallout', arg: card.uuid }
                    ]
                },
                waitingPromptTitle: 'Waiting for opponent to decide if he runs or fights'
            });
        } else {
            this.acceptCallout(card.controller, card.uuid);
        }
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
        this.game.resolveGameAction(GameActions.sendHome({ card: targetDude, options: { isCardEffect: false } }));
        this.game.addMessage('{0} uses {1} to call out {2} who runs home to mama.', this.owner, this, targetDude);
        return true;
    }

    canAttachWeapon() {
        let weapons = this.getAttachmentsByKeywords(['weapon']);
        if(weapons && weapons.length >= this.maxWeapons) {
            return false;
        }
        return true;
    }

    canAttachHorse() {
        let horses = this.getAttachmentsByKeywords(['horse']);
        if(horses && horses.length >= this.maxHorses) {
            return false;
        }
        return true;
    }

    canAttachAttire() {
        let attires = this.getAttachmentsByKeywords(['attire']);
        if(attires && attires.length >= this.maxAttires) {
            return false;
        }
        return true;
    }

    needToMoveToJoinPosse() {
        let shootout = this.game.shootout;
        if(!shootout) {
            return false;
        }
        return this.gamelocation !== shootout.mark.gamelocation;
    }

    requirementsToJoinPosse(allowBooted = false) {
        if(!this.needToMoveToJoinPosse()) {
            return { canJoin: true, needToBoot: false };
        }
        let shootout = this.game.shootout;
        if(!shootout) {
            return { canJoin: false };
        } 
        if(this.getGameLocation().isAdjacent(shootout.mark.gamelocation) && (!this.booted || allowBooted)) {
            return { canJoin: true, needToBoot: true };
        }

        if(shootout.isJob() && shootout.belongsToLeaderPlayer(this) && (!this.booted || allowBooted)) {
            if(this.gamelocation === shootout.leader.gamelocation) {
                return { canJoin: true, needToBoot: true };
            } 
            if(this.getGameLocation().isAdjacent(shootout.leader.gamelocation)) {
                return { canJoin: true, needToBoot: true };
            }         
        }

        return { canJoin: false };
    }

    canLeadJob(player) {
        if(this.controller !== player) {
            return false;
        }
        if(this.booted) {
            return false;
        }
        return true;
    }

    moveToShootoutLocation(needToBoot = true, allowBooted = false) {
        let shootout = this.game.shootout;
        if(this.gamelocation === shootout.mark.gamelocation) {
            return;
        }
        if(shootout.isJob()) {
            // if this shootout is a Job, all dudes that had to be booted should already be booted.
            needToBoot = false;
        }
        let options = { 
            isCardEffect: false, 
            needToBoot: needToBoot, 
            allowBooted: allowBooted 
        };
        this.game.raiseEvent('onDudeMoved', { card: this, targetUuid: shootout.mark.gamelocation, moveType: 'toPosse', options: options }, event => {
            event.card.controller.moveDude(event.card, event.targetUuid, event.options);
        });
    }
    
    get bounty() {
        return this.tokens[Tokens.bounty] || 0;
    }

    increaseBounty(amount = 1) {
        this.modifyToken(Tokens.bounty, amount);
        this.game.raiseEvent('onCardBountyChanged', { card: this, amount: amount });
    }

    decreaseBounty(amount = 1) {
        this.modifyToken(Tokens.bounty, amount * -1);
        this.game.raiseEvent('onCardBountyChanged', { card: this, amount: amount * -1 });
    }

    collectBounty(player) {
        this.game.raiseEvent('onBountyCollected', { card: this, collector: player }, event => {
            event.collector.modifyGhostRock(event.card.bounty);
            event.card.game.addMessage('{0} collects {1} GR bounty for {2}.', event.collector, event.card.bounty, event.card);
        });
    }

    isAtHome() {
        if(this.location !== 'play area') {
            return false;
        }
        return this.getGameLocation().isHome(this.controller);
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

    isSkilled() {
        return this.hasKeyword('mad scientist') || this.isSpellCaster();
    }

    isSpellCaster() {
        return this.hasKeyword('blessed') || this.hasKeyword('huckster') || this.hasKeyword('shaman');
    }

    canCastSpell(spell) {
        if(!this.isSpellCaster()) {
            return false;
        }
        if(!this.controller.isValidSkillCombination(this, spell)) {
            return false;
        }
        return this.spellFunc(spell);
    }

    leavesPlay() {
        let currentLocation = this.getGameLocation();
        if(currentLocation) {
            currentLocation.removeDude(this);
        }
        super.leavesPlay();

        if(this.game.shootout) {
            this.game.shootout.removeFromPosse(this);
        }
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
