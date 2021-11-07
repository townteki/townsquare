const DrawCard = require('./drawcard.js');
const TradingPrompt = require('./gamesteps/highnoon/tradingprompt.js');
const GameActions = require('./GameActions');
const {ShootoutStatuses, Tokens} = require('./Constants');
const NullEvent = require('./NullEvent.js');
const SpellCard = require('./spellcard.js');
const ActionCard = require('./actioncard.js');
const AbilityDsl = require('./abilitydsl.js');
const PhaseNames = require('./Constants/PhaseNames.js');

class DudeCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.gritFunc = null;
        this.currentUpkeep = this.cardData.upkeep;
        this.permanentUpkeep = 0;
        this.currentDeedInfluence = 0;

        this.shootoutStatus = ShootoutStatuses.None;
        this.acceptedCallout = false;
        this.skillKfBonuses = [];
        this.skillKfConditions = [];
        this.studReferenceArray = [];
        this.studReferenceArray.unshift({ source: 'default', shooter: this.cardData.shooter});
        this.spellFunc = spell => {
            if(spell.isTotem()) {
                return spell.gamelocation === this.gamelocation;
            }
            return spell.parent === this;
        };
        this.persistentEffect({
            condition: () => this.controller.outfit && 
                    this.gang_code !== this.controller.outfit.gang_code && 
                    this.gang_code !== 'neutral',
            match: this,
            effect: AbilityDsl.effects.dynamicUpkeep(() => this.influence),
            fromTrait: false
        });
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.isKungFu(),
            match: this,
            effect: AbilityDsl.effects.dynamicValue(() => this.getKungFuRating()),
            fromTrait: false
        });
        this.setupDudeCardAbilities();
    }

    get bullets() {
        let tempBullets = super.bullets;
        if(this.maxBullets && this.maxBullets < tempBullets) {
            return this.maxBullets;
        }
        return tempBullets;
    }

    set bullets(amount) {
        super.bullets = amount;
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

    get deedInfluence() {
        if(this.currentDeedInfluence < 0) {
            return 0;
        }
        return this.currentDeedInfluence;
    }

    set deedInfluence(amount) {
        this.currentDeedInfluence = amount;
    }

    getStat(statName) {
        if(statName.startsWith('skill:')) {
            const skillName = statName.split(':')[1];
            return this.getSkillRating(skillName);
        }
        switch(statName) {
            // TODO M2 need to separate general influence and influence for controling deeds
            case 'influence': 
                return this.influence;
            case 'influence:deed': 
                return this.influence + this.deedInfluence;
            case 'bullets':
                return this.bullets;
            case 'bounty':
                return this.bounty;
        }
    }

    getSkills(onlyCastingSkills = false) {
        let skills = [];
        for(let keyword of this.keywords.getValues()) {
            if(keyword === 'huckster' || keyword === 'shaman' || keyword === 'blessed' ||
                (keyword === 'mad scientist' && !onlyCastingSkills)) {
                skills.push(keyword);
            }        
        }
        return skills;
    }

    getSkillRating(skillNameOrKF) {
        const baseSkillRating = this.keywords.getSkillRating(skillNameOrKF);
        if(baseSkillRating === null || baseSkillRating === undefined) {
            return;
        }
        const bonus = this.skillKfBonuses.reduce((aggregator, bonus) => {
            if(typeof(bonus.bonus) === 'function') {
                return aggregator + (bonus.bonus(skillNameOrKF) || 0);
            }
            return aggregator + bonus.bonus;
        }, 0);
        return baseSkillRating + bonus;
    }

    getSkillRatingForCard(spellOrGadget) {
        const condObj = this.skillKfConditions.find(condObj => condObj.condition(spellOrGadget));
        if(condObj) {
            return this.getSkillRating(condObj.skillnameOrKF);
        }
        if(spellOrGadget.isGadget()) {
            return this.getSkillRating('mad scientist');
        }
        if(spellOrGadget.getType() !== 'goods' && spellOrGadget.getType() !== 'spell') {
            return;
        }
        if(spellOrGadget.isMiracle()) {
            return this.getSkillRating('blessed');
        }
        if(spellOrGadget.isHex()) {
            return this.getSkillRating('huckster');
        }
        if(spellOrGadget.isSpirit() || spellOrGadget.isTotem()) {
            return this.getSkillRating('shaman');
        }
    }

    getKungFuRating() {
        return this.getSkillRating('kung fu');
    }

    canPerformSkillOn(spellOrGadget) {
        const skillRating = this.getSkillRatingForCard(spellOrGadget);
        return skillRating !== null && skillRating !== undefined;
    }

    /**
     * Returns Grit (value + bullets + influence) of a dude.
     * @param {AbilityContext} context This context is needed for specific cards (e.g. Lorena Corbett)
     * @returns {number}
     */
    getGrit(context) {
        const currentGrit = this.value + this.bullets + this.influence;
        if(this.gritFunc) {
            return this.gritFunc(currentGrit, context);
        }
        return currentGrit;
    }

    modifyUpkeep(amount, applying = true, fromEffect = false) {
        this.currentUpkeep += amount;
        if(!fromEffect) {
            this.permanentUpkeep += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardUpkeepChanged', params);
    }

    modifyDeedInfluence(amount, applying = true) {
        this.currentDeedInfluence += amount;

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardDeedInfluenceChanged', params);
    }

    setupDudeCardAbilities() {
        this.action({
            title: 'Move',
            abilitySourceType: 'game',
            condition: () => this.game.currentPhase === PhaseNames.HighNoon && !this.booted,
            target: { cardType: 'location' },
            targetController: 'current',
            actionContext: { card: this, gameAction: 'moveDude' },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: this, 
                    targetUuid: context.target.uuid, 
                    options: { 
                        isCardEffect: false
                    } 
                }), context);
            },
            player: this.controller,
            printed: false
        });
        this.action({
            title: 'Call Out',
            abilitySourceType: 'game',
            condition: () => this.game.currentPhase === PhaseNames.HighNoon && !this.booted,
            target: {
                activePromptTitle: 'Select dude to call out',
                cardCondition: card => card.getType() === 'dude' && this.gamelocation &&
                    card.gamelocation === this.gamelocation &&
                    (!this.game.isHome(this.gamelocation, card.controller) || card.canBeCalledOutAtHome()) &&
                    card.uuid !== this.uuid &&
                    card.controller !== this.controller,
                autoSelect: false,
                gameAction: 'callout'
            },
            targetController: 'opponent',
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ 
                    caller: this, 
                    callee: context.target, 
                    isCardEffect: false 
                }), context);
            },
            player: this.controller,
            printed: false
        });  
        this.action({
            title: 'Trade',
            abilitySourceType: 'game',
            condition: () => this.game.currentPhase === PhaseNames.HighNoon && 
                this.isInControlledLocation() &&
                this.hasAttachmentForTrading(),
            target: {
                activePromptTitle: 'Select attachment(s) to trade',
                multiSelect: true,
                numCards: 0,
                cardCondition: card => this.canTradeGoods(card)
            },
            targetController: 'current',
            handler: context => {
                this.game.queueStep(new TradingPrompt(this.game, context.player, context.target));
            },
            player: this.controller,
            printed: false
        });  
    }

    createSnapshot(clone, cloneBaseAttributes = true) {
        if(!clone) {
            clone = new DudeCard(this.owner, this.cardData);
        }
        clone = super.createSnapshot(clone, cloneBaseAttributes);

        clone.currentUpkeep = this.currentUpkeep;
        clone.shootoutStatus = this.shootoutStatus;
        if(cloneBaseAttributes) {
            clone.studReferenceArray = this.studReferenceArray;
        }

        return clone;
    }

    addStudEffect(source, shooterType) {
        this.studReferenceArray.unshift({ source: source, shooter: shooterType});
        this.game.raiseEvent('onDudeBecomesStud', { card: this });
    }

    removeStudEffect(source) {
        this.studReferenceArray = this.studReferenceArray.filter(studRef => studRef.source !== source);
    }

    sendHome(options = {}, context) {
        if(options.needToBoot) {
            this.game.resolveGameAction(GameActions.bootCard({ card: this }), context);
        }
        this.game.resolveGameAction(GameActions.moveDude({ card: this, targetUuid: this.controller.outfit.uuid, options }), context);
        if(options.fromPosse && this.game.shootout && !options.isAfterJob) {
            this.game.resolveGameAction(GameActions.removeFromPosse({ card: this }), context);
        } 
    }

    moveToLocation(destinationUuid, options = {}) {
        let origin = this.getGameLocation();
        if(origin) {
            origin.removeDude(this);
            this.game.raiseEvent('onDudeLeftLocation', { card: this, gameLocation: origin, options });
        }
        let destination = this.game.findLocation(destinationUuid);
        if(destination && this.location !== 'out of game') {
            destination.addDude(this);
            this.game.raiseEvent('onDudeEnteredLocation', { card: this, gameLocation: destination, options });
        }
    }

    upgrade(expDude) {
        expDude.controller.moveCard(expDude, 'play area', { raiseEvents: false });

        expDude.shootoutStatus = this.shootoutStatus;
        expDude.booted = this.booted;
        expDude.parent = this.parent;
        expDude.location = this.location;
        expDude.gameLoc = this.gameLoc;
        expDude.events = this.events;
        expDude.eventsForRegistration = this.eventsForRegistration;

        const allEffects = this.game.effectEngine.getAllEffectsOnCard(this);
        allEffects.forEach(effect => {
            effect.removeTarget(this);
            effect.addAndApplyTarget(expDude);
            if(Array.isArray(effect.match)) {
                if(effect.match.includes(this)) {
                    effect.match = effect.match.filter(matchTarget => matchTarget !== this);
                    effect.match.push(expDude);
                }
            } else if(effect.match === this) {
                effect.match = expDude;
            }
        });

        expDude.attachments = [];
        this.attachments.forEach(attachment => {
            expDude.controller.attach(attachment, expDude, 'upgrade');
        });

        this.controller.moveCard(this, 'discard pile', { raiseEvents: false });
    }

    canRejectCallout(fromDude, canReject) {
        if(!canReject) {
            return false;
        }
        if(fromDude.calloutCannotBeRefused(this) || this.cannotRefuseCallout(fromDude)) {
            return false;
        }
        const tempContext = { game: this.game, player: this.controller };
        return this.canRefuseWithoutGoingHomeBooted() || (this.allowGameAction('boot', tempContext) && this.allowGameAction('moveDude', tempContext));
    }

    canTradeGoods(card) {
        return card.getType() === 'goods' && 
        card.parent === this &&
        !card.wasTraded() &&
        !card.cannotBeTraded();        
    }

    callOut(card, canReject = true) {
        this.game.raiseEvent('onDudeCalledOut', { caller: this, callee: card, canReject: canReject });
        this.shootoutStatus = ShootoutStatuses.CallingOut;
        card.shootoutStatus = ShootoutStatuses.CalledOut;
        if(!card.booted && card.canRejectCallout(this, canReject)) {
            this.game.promptWithMenu(card.controller, this, {
                activePrompt: {
                    menuTitle: this.title + ' is calling out ' + card.title,
                    buttons: [
                        { text: 'Accept Callout', method: 'acceptCallout', arg: card.uuid },
                        { text: 'Refuse Callout', method: 'rejectCallout', arg: card.uuid }
                    ]
                },
                waitingPromptTitle: 'Waiting for opponent to decide if they run or fight'
            });
        } else {
            this.acceptCallout(card.controller, card.uuid);
        }
    }

    acceptCallout(player, targetUuid) {
        let targetDude = player.findCardInPlayByUuid(targetUuid);
        this.acceptedCallout = true;
        this.game.addMessage('{0} uses {1} to call out {2} who accepts', this.owner, this, targetDude);
        this.game.raiseEvent('onDudeAcceptedCallOut', { caller: this, callee: targetDude });
        return true;
    }

    rejectCallout(player, targetUuid) {
        let targetDude = player.findCardInPlayByUuid(targetUuid);
        this.shootoutStatus = ShootoutStatuses.None;
        targetDude.shootoutStatus = ShootoutStatuses.None;
        this.acceptedCallout = false;
        if(!targetDude.canRefuseWithoutGoingHomeBooted()) {
            this.game.resolveGameAction(GameActions.sendHome({ card: targetDude, options: { isCardEffect: false } }));
            this.game.addMessage('{0} uses {1} to call out {2} who runs home to mama', this.owner, this, targetDude);
        } else {
            this.game.addMessage('{0} uses {1} to call out {2} who refuses and stays put', this.owner, this, targetDude);
        }
        this.game.raiseEvent('onDudeRejectedCallOut', { caller: this, callee: targetDude });
        return true;
    }

    hasHorse() {
        return this.hasAttachment(att => att.hasKeyword('Horse'));
    }

    checkWeaponLimit() {
        let weapons = this.getAttachmentsByKeywords(['weapon']);
        if(weapons && weapons.length > 1) {
            return {
                limit: 1,
                cards: weapons
            };
        }
        return null;        
    }

    checkHorseLimit() {
        let horses = this.getAttachmentsByKeywords(['horse']);
        if(horses && horses.length > 1) {
            return {
                limit: 1,
                cards: horses
            };
        }
        return null;
    }

    checkAttireLimit() {
        let attires = this.getAttachmentsByKeywords(['attire']);
        if(attires && attires.length > 1) {
            return {
                limit: 1,
                cards: attires
            };
        }
        return null;
    }

    // what can be in `moveOptions` can be found in `player.moveDude()`
    canMoveWithoutBooting(moveOptions) {
        return this.options.contains('canMoveWithoutBooting', moveOptions);
    }

    canJoinWithoutMoving() {
        return this.options.contains('canJoinWithoutMoving', this);
    }

    cannotBootToJoinFromAdjacent() {
        return this.options.contains('cannotBootToJoinFromAdjacent', this);
    }

    canJoinWithoutBooting() {
        return this.options.contains('canJoinWithoutBooting', this);
    }

    canJoinWhileBooted() {
        return this.options.contains('canJoinWhileBooted', this);
    }

    canBeCalledOutAtHome() {
        return this.options.contains('canBeCalledOutAtHome', this);
    }

    canCallOutAdjacent() {
        return this.options.contains('canCallOutAdjacent', this);
    }

    getMoveOptions() {
        return {
            moveToPosse: !this.canJoinWithoutMoving(),
            needToBoot: !this.canJoinWithoutBooting(),
            allowBooted: !this.canJoinWhileBooted()
        };
    }

    needToMoveToJoinPosse() {
        let shootout = this.game.shootout;
        if(!shootout) {
            return false;
        }
        return this.gamelocation !== shootout.gamelocation;
    }

    requirementsToJoinPosse(allowBooted = false) {
        if(!this.needToMoveToJoinPosse()) {
            return { canJoin: true, needToBoot: false };
        }
        let shootout = this.game.shootout;
        if(!shootout) {
            return { canJoin: false };
        } 
        if(this.isAdjacent(shootout.gamelocation) && (!this.booted || allowBooted)) {
            if(this.cannotBootToJoinFromAdjacent()) {
                return { canJoin: false };
            }
            return { canJoin: true, needToBoot: true };
        }

        if(shootout.isJob() && shootout.belongsToLeaderPlayer(this) && (!this.booted || allowBooted)) {
            if(this.gamelocation === shootout.leader.gamelocation) {
                return { canJoin: true, needToBoot: true };
            } 
            if(this.isAdjacent(shootout.leader.gamelocation)) {
                if(this.cannotBootToJoinFromAdjacent()) {
                    return { canJoin: false };
                }
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

    moveToShootoutLocation(options = {}) {
        let shootout = this.game.shootout;
        if(this.gamelocation === shootout.gamelocation) {
            return true;
        }
        if(shootout.isJob()) {
            // if this shootout is a Job, all dudes that had to be booted should already be booted.
            options.needToBoot = false;
        }
        let updatedOptions = Object.assign({ isCardEffect: false, needToBoot: true, allowBooted: false, toPosse: true }, options);
        let event = this.game.resolveGameAction(GameActions.moveDude({ 
            card: this, 
            targetUuid: shootout.gamelocation,
            options: updatedOptions
        }), options.context);
        return !(event instanceof NullEvent);
    }
    
    get bounty() {
        return this.tokens[Tokens.bounty] || 0;
    }

    increaseBounty(amount = 1, max = 999) {
        if(amount <= 0 || this.bounty >= max) {
            return;
        }
        let realAmount = amount;
        if(this.bounty + amount > max) {
            realAmount = max - this.bounty;
        }
        this.modifyToken(Tokens.bounty, realAmount);
        this.game.raiseEvent('onCardBountyChanged', { card: this, amount: realAmount });
    }

    decreaseBounty(amount = 1, min = 0) {
        if(amount <= 0 || this.bounty <= min) {
            return;
        }
        let realAmount = amount;
        if(this.bounty - amount < min) {
            realAmount = this.bounty - min;
        }
        this.modifyToken(Tokens.bounty, realAmount * -1);
        this.game.raiseEvent('onCardBountyChanged', { card: this, amount: realAmount * -1 });
    }

    collectBounty(player) {
        this.game.raiseEvent('onBountyCollected', { card: this, collector: player }, event => {
            event.collector.modifyGhostRock(event.card.bounty);
            event.card.game.addMessage('{0} collects {1} GR bounty for {2}.', event.collector, event.card.bounty, event.card);
        });
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
        return this.hasKeyword('mad scientist') || this.isSpellcaster();
    }

    isSpellcaster() {
        return this.hasKeyword('blessed') || this.hasKeyword('huckster') || this.hasKeyword('shaman');
    }

    isKungFu() {
        return this.hasKeyword('kung fu');
    }

    canCastSpell(spell) {
        if(!(spell instanceof SpellCard)) {
            return false;
        }
        return this.canPerformSkillOn(spell) && this.spellFunc(spell);
    }

    canPerformTechnique(card) {
        if(!(card instanceof ActionCard) || !card.hasKeyword('technique')) {
            return false;
        }
        const kfRating = this.getKungFuRating(card);
        return kfRating !== null && kfRating !== undefined;    
    }

    addSkillKfBonus(bonus, source) {
        this.skillKfBonuses.push({ bonus, source });
    }

    removeSkillKfBonus(source) {
        this.skillKfBonuses = this.skillKfBonuses.filter(bonus => bonus.source !== source);
    }

    leavesPlay() {
        let currentLocation = this.getGameLocation();
        if(currentLocation) {
            currentLocation.removeDude(this);
        }
        super.leavesPlay();

        if(this.isParticipating()) {
            this.game.raiseEvent('onDudeLeftPosse', { card: this, shootout: this.game.shootout }, event => {
                event.shootout.removeFromPosse(event.card);
            });
        }
        this.studReferenceArray = [];
        this.studReferenceArray.unshift({ source: 'default', shooter: this.cardData.shooter});
        this.upkeep = this.currentUpkeep - this.permanentUpkeep;
        this.permanentUpkeep = 0;
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
