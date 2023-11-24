const DrawCard = require('./drawcard.js');
const TradingPrompt = require('./gamesteps/highnoon/tradingprompt.js');
const GameActions = require('./GameActions');
const {ShootoutStatuses, Tokens} = require('./Constants');
const NullEvent = require('./NullEvent.js');
const SpellCard = require('./spellcard.js');
const ActionCard = require('./actioncard.js');
const AbilityDsl = require('./abilitydsl.js');
const PhaseNames = require('./Constants/PhaseNames.js');
const PlayingTypes = require('./Constants/PlayingTypes.js');

class DudeCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.gritFunc = null;
        this.currentDeedInfluence = 0;

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
                    !this.belongsToGang(this.controller.getFaction()) && 
                    !this.belongsToGang('neutral'),
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
        return baseSkillRating;
    }

    getSkillCheckBonus(skillNameOrKF) {
        return this.skillKfBonuses.reduce((aggregator, bonus) => {
            if(typeof(bonus.bonus) === 'function') {
                return aggregator + (bonus.bonus(skillNameOrKF) || 0);
            }
            return aggregator + bonus.bonus;
        }, 0);
    }

    getSkillForCard(spellOrGadget) {
        const condObj = this.skillKfConditions.find(condObj => condObj.condition(spellOrGadget));
        if(condObj) {
            return condObj.skillnameOrKF;
        }
        if(spellOrGadget.isGadget()) {
            return 'mad scientist';
        }
        if(spellOrGadget.getType() !== 'goods' && spellOrGadget.getType() !== 'spell') {
            return;
        }
        if(spellOrGadget.isMiracle()) {
            return 'blessed';
        }
        if(spellOrGadget.isHex()) {
            return 'huckster';
        }
        if(spellOrGadget.isSpirit() || spellOrGadget.isTotem()) {
            return 'shaman';
        }
    }

    getKungFuRating() {
        return this.getSkillRating('kung fu');
    }

    belongsToGang(gang) {
        return this.gang_code.includes(gang);
    }

    canPerformSkillOn(spellOrGadget) {
        const skillName = this.getSkillForCard(spellOrGadget);
        if(!skillName) {
            return false;
        }
        const skillRating = this.getSkillRating(skillName);
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
                    !card.controller.equals(this.controller) &&
                    !this.cannotMakeCallout(card),
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
        if(this.isAtHome()) {
            if(options.needToBoot) {
                this.game.resolveGameAction(GameActions.bootCard({ card: this }), context).thenExecute(() =>
                    this.game.addMessage('{0} sends {1} home booted', this.controller, this));                
            }
        } else {
            this.game.resolveGameAction(GameActions.moveDude({ card: this, targetUuid: this.controller.outfit.uuid, options }), context);
        }
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
        expDude.tokens = Object.assign({}, this.tokens); 
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
            } else if(this.equals(effect.match)) {
                effect.match = expDude;
            }
        });

        expDude.attachments = [];
        this.attachments.forEach(attachment => {
            expDude.controller.attach(attachment, expDude, PlayingTypes.Upgrade);
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
        this.equals(card.parent) &&
        !card.wasTraded() &&
        !card.cannotBeTraded();        
    }

    callOut(card, canReject = true) {
        this.game.raiseEvent('onDudeCalledOut', { caller: this, callee: card, canReject: canReject });
        this.shootoutStatus = ShootoutStatuses.CallingOut;
        card.shootoutStatus = ShootoutStatuses.CalledOut;
        if(!card.booted && card.canRejectCallout(this, canReject)) {
            card.controller.decideCallout(this, card);
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
        this.game.addMessage('{0} uses {1} to call out {2} who refuses', this.controller, this, targetDude);
        if(!targetDude.canRefuseWithoutGoingHomeBooted()) {
            this.game.resolveGameAction(GameActions.sendHome({ card: targetDude, options: { isCardEffect: false, reason: 'callout_reject' } })).thenExecute(event => {
                if(!event.handlerReplaced) {
                    this.game.addMessage('{0}\'s dude {1} runs home to mama after they refused callout from {2}', targetDude.controller, targetDude, this);
                }
            });
        } else {
            this.game.addMessage('{0}\'s dude {1} stays put after they refused callout from {2}', targetDude.controller, targetDude, this);
        }
        this.game.raiseEvent('onDudeRejectedCallOut', { caller: this, callee: targetDude });
        return true;
    }

    hasHorse() {
        return this.hasAttachment(att => att.hasKeyword('Horse'));
    }

    hasWeapon() {
        return this.hasAttachment(att => att.hasKeyword('Weapon'));
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

    hasSidekick() {
        return this.hasAttachment(att => att.hasKeyword('Sidekick'));
    }

    hasAttire() {
        return this.hasAttachment(att => att.hasKeyword('Attire'));
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

    requirementsToMove(origin, destination, options = {}) {
        if(origin.uuid === destination.uuid) {
            return { canMove: false };
        }

        if(this.booted) {
            if((!options.needToBoot && options.isCardEffect) || options.allowBooted) {
                return { canMove: true, needToBoot: false };
            }
            return { canMove: false };
        }

        if(this.canMoveWithoutBooting(Object.assign(options, { dude: this, origin, destination }))) {
            return { canMove: true, needToBoot: false };
        }

        if(options.isCardEffect) {
            return { canMove: true, needToBoot: options.needToBoot};
        }

        if(options.needToBoot === null || options.needToBoot === undefined) {
            if(!origin.isAdjacent(destination.uuid)) {
                return { canMove: true, needToBoot: true };
            } 
            if(origin.isTownSquare()) {
                if(destination.uuid === this.controller.outfit.uuid) {
                    return { canMove: true, needToBoot: true };
                }
            } else if(origin.uuid !== this.controller.outfit.uuid) {
                return { canMove: true, needToBoot: true };
            }
            return { canMove: true, needToBoot: false };
        }

        return { canMove: true, needToBoot: options.needToBoot };
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
        if(!this.controller.equals(player)) {
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
        }), options.context || { game: this.game, player: this.controller });
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

    isDrawAfterShootout() {
        const clonedGame = this.game.simulateEndOfShootout();
        const clonedCard = clonedGame.findCardInPlayByUuid(this.uuid);
        return clonedCard.isDraw();
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
        return !this.cannotCastSpell(spell) && 
            this.canPerformSkillOn(spell) && 
            this.spellFunc(spell);
    }

    canPerformTechnique(card) {
        if(!(card instanceof ActionCard) || !card.hasKeyword('technique')) {
            return false;
        }
        const kfRating = this.getKungFuRating(card);
        return kfRating !== null && kfRating !== undefined;    
    }

    cannotCastSpell(spell) {
        return this.options.contains('cannotCastSpell', spell);
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
    }

    getSummary(activePlayer) {
        let drawCardSummary = super.getSummary(activePlayer);

        let publicSummary = {
            shooter: this.shooter
        };

        if(drawCardSummary.facedown) {
            return Object.assign(drawCardSummary, publicSummary);
        }

        return Object.assign(drawCardSummary, publicSummary, {});
    }    
}

module.exports = DudeCard;
