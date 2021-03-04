const CardTextDefinition = require('./CardTextDefinition');
const CostReducer = require('./costreducer.js');
const PlayableLocation = require('./playablelocation.js');
const CannotRestriction = require('./cannotrestriction.js');
const ImmunityRestriction = require('./immunityrestriction.js');
const GhostRockSource = require('./GhostRockSource.js');

function cannotEffect(type, playType) {
    return function(controller, predicate) {
        return restrictionEffect(new CannotRestriction(type, playType, controller, predicate));
    };
}

// if specific ability play type cannot be played on card (e.g. shootout, resolution)
function cannotEffectPlayType(playType) {
    return function(controller, predicate) {
        return restrictionEffect(CannotRestriction.forAnyType(playType, predicate, controller));
    };
}

// if specific game actions cannot be played on card (e.g. ace, discard, callout, target)
function cannotEffectType(type) {
    return function(controller, predicate) {
        return restrictionEffect(CannotRestriction.forAnyPlayType(type, predicate, controller));
    };
}

function restrictionEffect(restriction) {
    return {
        apply: function(card) {
            card.addAbilityRestriction(restriction);
        },
        unapply: function(card) {
            card.removeAbilityRestriction(restriction);
        }
    }; 
}

function losesAspectEffect(aspect) {
    return function() {
        return {
            apply: function(card) {
                card.loseAspect(aspect);
            },
            unapply: function(card) {
                card.restoreAspect(aspect);
            }
        };
    };
}

function shootoutOptionEffect(key) {
    return function() {
        return {
            apply: function(card) {
                card.shootoutOptions.add(key);
            },
            unapply: function(card) {
                card.shootoutOptions.remove(key);
            }
        };
    };
}

function adjacency(type) {
    return function(location, source) {
        return {
            apply: function(card) {
                if(card.isLocationCard()) {
                    card.addAdjacencyLocation(location, source, type);
                }
            },
            unapply: function(card) {
                card.removeAdjacencyLocation(location, source, type);
            }
        };
    };
}

function conditionalAdjacency() {
    return function (condition, source, type) {
        return {
            apply: function(card, context) {
                if(!card.isLocationCard()) {
                    return;
                }
                context.dynamicAdjacency = context.dynamicAdjacency || {};
                context.dynamicAdjacency[card.uuid] = context.game.findLocations(card => condition(card)) || [];
                card.addAdjacencyLocations(context.dynamicAdjacency[card.uuid], source, type);
            },
            reapply: function(card, context) {
                let currentAdjacency = context.dynamicAdjacency[card.uuid];
                let newAdjacency = context.game.findLocations(card => condition(card)) || [];
                context.dynamicAdjacency[card.uuid] = newAdjacency;
                let addAdjacencies = newAdjacency.filter(location => !currentAdjacency.includes(location));
                let removeAdjacencies = currentAdjacency.filter(location => !newAdjacency.includes(location));
                card.addAdjacencyLocations(addAdjacencies, source, type);
                card.removeAdjacencyLocations(removeAdjacencies, source, type);
            },
            unapply: function(card, context) {
                let removeAdjacencies = context.dynamicAdjacency[card.uuid];
                card.removeAdjacencyLocations(removeAdjacencies, source, type);
                delete context.dynamicAdjacencies[card.uuid];
            },
            isStateDependent: true
        };
    };
}

const Effects = {
    setAsStud: function(sourceUuid) {
        return {
            apply: function(card) {
                if(card.getType() === 'dude') {
                    card.addStudEffect(sourceUuid, 'Stud');
                }
            },
            unapply: function(card) {
                if(card.getType() === 'dude') {
                    card.removeStudEffect(sourceUuid);
                }
            }
        };
    },
    setAsDraw: function(sourceUuid) {
        return {
            apply: function(card) {
                if(card.getType() === 'dude') {
                    card.addStudEffect(sourceUuid, 'Draw');
                }
            },
            unapply: function(card) {
                if(card.getType() === 'dude') {
                    card.removeStudEffect(sourceUuid);
                }
            }
        };
    },
    setSetupGold: function(value) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.setupGold = value;
            },
            unapply: function(player) {
                player.setupGold = 8;
            }
        };
    },
    determineControlByBullets: function() {
        return {
            apply: function(card) {
                if(card.getType() === 'dude') {
                    card.controlDeterminator = 'bullets';
                }
            },
            unapply: function(card) {
                if(card.getType() === 'dude') {
                    card.controlDeterminator = 'influence:deed';
                }
            }
        };
    }, 
    entersPlayBooted: function() {
        return {
            apply: function(card) {
                card.entersPlayBooted = true;
            },
            unapply: function(card) {
                card.entersPlayBooted = false;
            }
        };
    },
    setCardType: function(type) {
        return {
            apply: function(card) {
                card.setCardType(type);
            },
            unapply: function(card) {
                card.setCardType(undefined);
            }
        };
    },
    doesNotGetBountyOnJoin: shootoutOptionEffect('doesNotGetBountyOnJoin'),
    restrictAttachmentsTo: function(trait) {
        return Effects.addKeyword(`No attachments except <i>${trait}</i>`);
    },
    modifyBullets: function(value) {
        return {
            gameAction: value < 0 ? 'decreaseBullets' : 'increaseBullets',
            apply: function(card) {
                card.modifyBullets(value, true);
            },
            unapply: function(card) {
                card.modifyBullets(-value, false);
            }
        };
    },
    modifyInfluence: function(value) {
        return {
            gameAction: value < 0 ? 'decreaseInfluence' : 'increaseInfluence',
            apply: function(card) {
                card.modifyInfluence(value, true);
            },
            unapply: function(card) {
                card.modifyInfluence(-value, false);
            }
        };
    },
    setInfluence: function(value) {
        let changeAmount = 0;
        return {
            gameAction: 'setInfluence',
            apply: function(card) {
                changeAmount = value - card.influence;
                card.modifyInfluence(changeAmount, true);
            },
            unapply: function(card) {
                card.modifyInfluence(changeAmount * -1);
            }
        };
    },
    modifyControl: function(value) {
        return {
            gameAction: value < 0 ? 'decreaseControl' : 'increaseControl',
            apply: function(card) {
                card.modifyControl(value, true);
            },
            unapply: function(card) {
                card.modifyControl(-value, false);
            }
        };
    },
    setControl: function(value) {
        let changeAmount = 0;
        return {
            gameAction: 'setControl',
            apply: function(card) {
                changeAmount = value - card.control;
                card.modifyControl(changeAmount, true);
            },
            unapply: function(card) {
                card.modifyControl(changeAmount * -1);
            }
        };
    },
    modifyValue: function(value) {
        return {
            gameAction: value < 0 ? 'decreaseValue' : 'increaseValue',
            apply: function(card) {
                card.modifyValue(value, true);
            },
            unapply: function(card) {
                card.modifyValue(-value, false);
            }
        };
    },
    modifyProduction: function(value) {
        return {
            gameAction: value < 0 ? 'decreaseProduction' : 'increaseProduction',
            apply: function(card) {
                card.modifyProduction(value, true);
            },
            unapply: function(card) {
                card.modifyProduction(-value, false);
            }
        };
    },
    modifyUpkeep: function(value) {
        return {
            gameAction: value < 0 ? 'decreaseUpkeep' : 'increaseUpkeep',
            apply: function(card) {
                card.modifyUpkeep(value, true);
            },
            unapply: function(card) {
                card.modifyUpkeep(-value, false);
            }
        };
    },
    modifySkillRating: function(value, type) {
        return {
            gameAction: value < 0 ? 'decreaseSkill' + type : 'increaseSkill' + type,
            apply: function(card) {
                card.modifySkillRating(type, value, true);
            },
            unapply: function(card) {
                card.modifySkillRating(type, -value, false);
            }
        };
    },
    additionalDynamicAdjacency: conditionalAdjacency(),
    preventDynamicAdjacency: conditionalAdjacency(),
    additionalAdjacency: adjacency('adjacent'),
    preventAdjacency: adjacency('prevent'),
    dynamicBullets: function(calculate, gameAction = 'increaseBullets') {
        return {
            gameAction: gameAction,
            apply: function(card, context) {
                context.dynamicBullets = context.dynamicBullets || {};
                context.dynamicBullets[card.uuid] = calculate(card, context) || 0;
                let value = context.dynamicBullets[card.uuid];
                card.modifyBullets(value, true);
            },
            reapply: function(card, context) {
                let currentBullets = context.dynamicBullets[card.uuid];
                let newBullets = calculate(card, context) || 0;
                context.dynamicBullets[card.uuid] = newBullets;
                let value = newBullets - currentBullets;
                card.modifyBullets(value, true);
            },
            unapply: function(card, context) {
                let value = context.dynamicBullets[card.uuid];
                card.modifyBullets(-value, false);
                delete context.dynamicBullets[card.uuid];
            },
            isStateDependent: true
        };
    },
    dynamicProduction: function(calculate, gameAction = 'increaseProduction') {
        return {
            gameAction: gameAction,
            apply: function(card, context) {
                context.dynamicProduction = context.dynamicProduction || {};
                context.dynamicProduction[card.uuid] = calculate(card, context) || 0;
                let value = context.dynamicProduction[card.uuid];
                card.modifyProduction(value, true);
            },
            reapply: function(card, context) {
                let currentProduction = context.dynamicProduction[card.uuid];
                let newProduction = calculate(card, context) || 0;
                context.dynamicProduction[card.uuid] = newProduction;
                let value = newProduction - currentProduction;
                card.modifyProduction(value, true);
            },
            unapply: function(card, context) {
                let value = context.dynamicProduction[card.uuid];
                card.modifyProduction(-value, false);
                delete context.dynamicProduction[card.uuid];
            },
            isStateDependent: true
        };
    },
    modifySundownDiscard: function(value) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.discardNumber += value;
            },
            unapply: function(player) {
                player.discardNumber -= value;
            }
        };
    },
    dynamicDecreaseStrength: function(calculate) {
        let negatedCalculate = (card, context) => -(calculate(card, context) || 0);
        return Effects.dynamicStrength(negatedCalculate, 'decreaseBullets');
    },
    doesNotReturnUnspentGold: function() {
        return {
            targetType: 'player',
            apply: function(player) {
                player.doesNotReturnUnspentGold = true;
            },
            unapply: function(player) {
                player.doesNotReturnUnspentGold = false;
            }
        };
    },
    addKeyword: function(keyword) {
        return {
            apply: function(card) {
                card.addKeyword(keyword);
            },
            unapply: function(card) {
                card.removeKeyword(keyword);
            }
        };
    },
    dynamicKeywords: function(keywordsFunc) {
        return {
            apply: function(card, context) {
                context.dynamicKeywords = context.dynamicKeywords || {};
                context.dynamicKeywords[card.uuid] = keywordsFunc(card, context) || [];
                for(let keyword of context.dynamicKeywords[card.uuid]) {
                    card.addKeyword(keyword);
                }
            },
            reapply: function(card, context) {
                for(let keyword of context.dynamicKeywords[card.uuid]) {
                    card.removeKeyword(keyword);
                }
                context.dynamicKeywords[card.uuid] = keywordsFunc(card, context);
                for(let keyword of context.dynamicKeywords[card.uuid]) {
                    card.addKeyword(keyword);
                }
            },
            unapply: function(card, context) {
                for(let keyword of context.dynamicKeywords[card.uuid]) {
                    card.removeKeyword(keyword);
                }
                delete context.dynamicKeywords[card.uuid];
            },
            isStateDependent: true
        };
    },
    removeKeyword: function(keyword) {
        return {
            apply: function(card) {
                card.removeKeyword(keyword);
            },
            unapply: function(card) {
                card.addKeyword(keyword);
            }
        };
    },
    addMultipleKeywords: function(keywords) {
        return {
            apply: function(card) {
                for(let keyword of keywords) {
                    card.addKeyword(keyword);
                }
            },
            unapply: function(card) {
                for(let keyword of keywords) {
                    card.removeKeyword(keyword);
                }
            }
        };
    },
    losesAllKeywords: losesAspectEffect('keywords'),
    losesAllTraits: losesAspectEffect('traits'),
    addTrait: function(trait) {
        return {
            apply: function(card) {
                card.addTrait(trait);
            },
            unapply: function(card) {
                card.removeTrait(trait);
            }
        };
    },
    removeTrait: function(trait) {
        return {
            apply: function(card) {
                card.removeTrait(trait);
            },
            unapply: function(card) {
                card.addTrait(trait);
            }
        };
    },
    blankExcludingTraits: {
        apply: function(card) {
            card.setBlank('excludingTraits');
        },
        unapply: function(card) {
            card.clearBlank('excludingTraits');
        }
    },
    fullBlank: {
        apply: function(card) {
            card.setBlank('full');
        },
        unapply: function(card) {
            card.clearBlank('full');
        }
    },
    setActionPlacementLocation: function(location) {
        return {
            apply: function(card) {
                card.actionPlacementLocation = location;
            },
            unapply: function(card) {
                card.actionPlacementLocation = 'discard pile';
            }
        };
    },
    discardIfStillInPlay: function(allowSave = false) {
        return {
            apply: function(card, context) {
                context.discardIfStillInPlay = context.discardIfStillInPlay || [];
                context.discardIfStillInPlay.push(card);
            },
            unapply: function(card, context) {
                if(card.location === 'play area' && context.discardIfStillInPlay.includes(card)) {
                    context.discardIfStillInPlay = context.discardIfStillInPlay.filter(c => c !== card);
                    card.controller.discardCard(card, allowSave);
                    context.game.addMessage('{0} discards {1} at the end of the phase because of {2}', context.source.controller, card, context.source);
                }
            }
        };
    },
    moveToDeadPileIfStillInPlay: function() {
        return {
            apply: function(card, context) {
                context.moveToDeadPileIfStillInPlay = context.moveToDeadPileIfStillInPlay || [];
                context.moveToDeadPileIfStillInPlay.push(card);
            },
            unapply: function(card, context) {
                if(card.location === 'play area' && context.moveToDeadPileIfStillInPlay.includes(card)) {
                    context.moveToDeadPileIfStillInPlay = context.moveToDeadPileIfStillInPlay.filter(c => c !== card);
                    card.owner.moveCard(card, 'dead pile');
                    context.game.addMessage('{0} moves {1} to its owner\'s dead pile at the end of the phase because of {2}', context.source.controller, card, context.source);
                }
            }
        };
    },
    moveToBottomOfDeckIfStillInPlay: function(allowSave = true) {
        return {
            apply: function(card, context) {
                context.moveToBottomOfDeckIfStillInPlay = context.moveToBottomOfDeckIfStillInPlay || [];
                context.moveToBottomOfDeckIfStillInPlay.push(card);
            },
            unapply: function(card, context) {
                if(['play area'].includes(card.location) && context.moveToBottomOfDeckIfStillInPlay.includes(card)) {
                    context.moveToBottomOfDeckIfStillInPlay = context.moveToBottomOfDeckIfStillInPlay.filter(c => c !== card);
                    card.owner.moveCardToBottomOfDeck(card, allowSave);
                    context.game.addMessage('{0} moves {1} to the bottom of its owner\'s deck at the end of the phase because of {2}', context.source.controller, card, context.source);
                }
            }
        };
    },
    returnToHandIfStillInPlay: function(allowSave = false, duration = 'phase') {
        return {
            apply: function(card, context) {
                context.returnToHandIfStillInPlay = context.returnToHandIfStillInPlay || [];
                context.returnToHandIfStillInPlay.push(card);
            },
            unapply: function(card, context) {
                if(card.location === 'play area' && context.returnToHandIfStillInPlay.includes(card)) {
                    context.returnToHandIfStillInPlay = context.returnToHandIfStillInPlay.filter(c => c !== card);
                    card.controller.returnCardToHand(card, allowSave);
                    context.game.addMessage('{0} returns {1} to hand at the end of the {2} because of {3}', context.source.controller, card, duration, context.source);
                }
            }
        };
    },
    shuffleIntoDeckIfStillInPlay: function(allowSave = true) {
        return {
            apply: function(card, context) {
                context.shuffleIntoDeckIfStillInPlay = context.shuffleIntoDeckIfStillInPlay || [];
                context.shuffleIntoDeckIfStillInPlay.push(card);
            },
            unapply: function(card, context) {
                if(card.location === 'play area' && context.shuffleIntoDeckIfStillInPlay.includes(card)) {
                    context.shuffleIntoDeckIfStillInPlay = context.shuffleIntoDeckIfStillInPlay.filter(c => c !== card);
                    card.owner.shuffleCardIntoDeck(card, allowSave);
                    context.game.addMessage('{0} shuffles {1} into their deck at the end of the phase because of {2}', card.owner, card, context.source);
                }
            }
        };
    },
    removeFromGame: function() {
        return {
            apply: function(card, context) {
                context.removeFromGame = context.removeFromGame || {};
                context.removeFromGame[card.uuid] = card.location;
                card.owner.removeCardFromGame(card);
            },
            unapply: function(card, context) {
                if(card.location === 'out of game') {
                    let originalLocation = context.removeFromGame[card.uuid];
                    if(originalLocation === 'play area') {
                        card.owner.putIntoPlay(card, { isEffectExpiration: true });
                    } else {
                        card.owner.moveCard(card, originalLocation);
                    }
                    context.game.addMessage('{0} is put into play because of {1}', card, context.source);
                    delete context.removeFromGame[card.uuid];
                }
            }
        };
    },
    optionalStandDuringStanding: function() {
        return {
            apply: function(card) {
                card.optionalStandDuringStanding = true;
            },
            unapply: function(card) {
                card.optionalStandDuringStanding = false;
            }
        };
    },
    immuneTo: function(cardCondition) {
        return {
            apply: function(card, context) {
                let restriction = new ImmunityRestriction(cardCondition, context.source);
                context.immuneTo = context.immuneTo || {};
                context.immuneTo[card.uuid] = restriction;
                card.addAbilityRestriction(restriction);
            },
            unapply: function(card, context) {
                let restriction = context.immuneTo[card.uuid];
                card.removeAbilityRestriction(restriction);
                delete context.immuneTo[card.uuid];
            }
        };
    },
    takeControl: function(newController) {
        return {
            apply: function(card, context) {
                let finalController = typeof newController === 'function' ? newController() : newController;
                context.game.takeControl(finalController, card, context.source);
                context.game.addMessage('{0} uses {1} to take control of {2}', context.source.controller, context.source, card);
            },
            unapply: function(card, context) {
                context.game.revertControl(card, context.source);
            }
        };
    },
    gainText: function(configureText) {
        const definition = new CardTextDefinition();
        configureText(definition);
        return definition;
    },
    cannotBeCalledOut: cannotEffectType('callout'),
    cannotPlay: function(condition) {
        let restriction = (card, playingType) => card.getType() === 'event' && playingType === 'play' && condition(card);
        return this.cannotPutIntoPlay(restriction);
    },
    cannotPutIntoPlay: function(restriction) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.playCardRestrictions.push(restriction);
            },
            unapply: function(player) {
                player.playCardRestrictions = player.playCardRestrictions.filter(r => r !== restriction);
            }
        };
    },
    cannotSetup: function(condition = () => true) {
        let restriction = (card, playingType) => playingType === 'setup' && condition(card);
        return this.cannotPutIntoPlay(restriction);
    },
    cannotBeAffectedByShootout: cannotEffectPlayType('shootout', 'opponent'),
    cannotBeTargetedByShootout: cannotEffect('target', 'shootout'),
    cannotBeTargeted: cannotEffectType('target'),
    cannotGainGold: function() {
        return {
            targetType: 'player',
            apply: function(player) {
                player.maxGoldGain.setMax(0);
            },
            unapply: function(player) {
                player.maxGoldGain.removeMax(0);
            }
        };
    },
    setMaxGoldGain: function(max) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.maxGoldGain.setMax(max);
            },
            unapply: function(player) {
                player.maxGoldGain.removeMax(max);
            }
        };
    },
    setMaxCardDraw: function(max) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.maxCardDraw.setMax(max);
            },
            unapply: function(player) {
                player.maxCardDraw.removeMax(max);
            }
        };
    },
    cannotWinGame: function() {
        return {
            targetType: 'player',
            apply: function(player) {
                player.cannotWinGame = true;
            },
            unapply: function(player, context) {
                player.cannotWinGame = false;
                context.game.checkWinCondition(player);
            }
        };
    },
    cannotTriggerCardAbilities: function(restriction = () => true) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.triggerRestrictions.push(restriction);
            },
            unapply: function(player) {
                player.triggerRestrictions = player.triggerRestrictions.filter(r => r !== restriction);
            }
        };
    },
    modifyDrawPhaseCards: function(value) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.drawPhaseCards += value;
            },
            unapply: function(player) {
                player.drawPhaseCards -= value;
            }
        };
    },
    modifyMaxLimited: function(amount) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.maxLimited += amount;
            },
            unapply: function(player) {
                player.maxLimited -= amount;
            }
        };
    },
    canSpendGhostRock: function(allowSpendingFunc) {
        return {
            apply: function(card, context) {
                let ghostrockSource = new GhostRockSource(card, allowSpendingFunc);
                context.canSpendGhostRock = context.canSpendGhostRock || {};
                context.canSpendGhostRock[card.uuid] = ghostrockSource;
                card.controller.addGoldSource(ghostrockSource);
            },
            unapply: function(card, context) {
                let ghostrockSource = context.canSpendGhostRock[card.uuid];
                card.controller.removeGoldSource(ghostrockSource);
                delete context.canSpendGhostRock[card.uuid];
            }
        };
    },
    setMinCost: function(value) {
        return {
            targetType: 'player',
            apply: function(player, context) {
                context.source.minCost = value;
            },
            unapply: function(player, context) {
                context.source.minCost = 0;
            }
        };
    },
    canPlay: function(predicate) {
        let playableLocation = new PlayableLocation('play', predicate);
        return {
            targetType: 'player',
            apply: function(player) {
                player.playableLocations.push(playableLocation);
            },
            unapply: function(player) {
                player.playableLocations = player.playableLocations.filter(l => l !== playableLocation);
            }
        };
    },
    canPlayFromOwn: function(location) {
        return {
            targetType: 'player',
            apply: function(player, context) {
                let playableLocation = new PlayableLocation('play', card => card.controller === player && card.location === location);
                context.canPlayFromOwn = context.canPlayFromOwn || {};
                context.canPlayFromOwn[player.name] = playableLocation;
                player.playableLocations.push(playableLocation);
            },
            unapply: function(player, context) {
                player.playableLocations = player.playableLocations.filter(l => l !== context.canPlayFromOwn[player.name]);
                delete context.canPlayFromOwn[player.name];
            }
        };
    },
    canSelectAsFirstPlayer: function(condition) {
        return {
            targetType: 'player',
            apply: function(player) {
                player.firstPlayerSelectCondition = condition;
            },
            unapply: function(player) {
                player.firstPlayerSelectCondition = null;
            }
        };
    },
    cannotStandMoreThan: function(max, match) {
        let restriction = { max: max, match: match };
        return {
            targetType: 'player',
            apply: function(player) {
                player.standPhaseRestrictions.push(restriction);
            },
            unapply: function(player) {
                player.standPhaseRestrictions = player.standPhaseRestrictions.filter(r => r !== restriction);
            }
        };
    },
    reduceCost: function(properties) {
        return {
            targetType: 'player',
            apply: function(player, context) {
                context.reducers = context.reducers || [];
                var reducer = new CostReducer(context.game, context.source, properties);
                context.reducers.push(reducer);
                player.addCostReducer(reducer);
            },
            unapply: function(player, context) {
                if(context.reducers.length > 0) {
                    for(let reducer of context.reducers) {
                        player.removeCostReducer(reducer);
                    }
                }
            }
        };
    },
    reduceSelfCost: function(playingTypes, amount) {
        return {
            targetType: 'player',
            apply: function(player, context) {
                context.reducers = context.reducers || [];
                let reducer = new CostReducer(context.game, context.source, {
                    playingTypes: playingTypes,
                    amount: amount,
                    match: card => card === context.source
                });
                context.reducers.push(reducer);
                player.addCostReducer(reducer);
            },
            unapply: function(player, context) {
                if(context.reducers.length > 0) {
                    for(let reducer of context.reducers) {
                        player.removeCostReducer(reducer);
                    }
                }
            }
        };
    },
    reduceNextCardCost: function(playingTypes, amount, match) {
        return this.reduceCost({
            playingTypes: playingTypes,
            amount: amount,
            match: match,
            limit: 1
        });
    },
    reduceNextPlayedCardCost: function(amount, match) {
        return this.reduceNextCardCost('play', amount, match);
    },
    reduceFirstCardCostEachRound: function(playingTypes, amount, match) {
        return this.reduceCost({
            playingTypes: playingTypes,
            amount: amount,
            match: match,
            limit: 1
        });
    },
    reduceFirstPlayedCardCostEachRound: function(amount, match) {
        return this.reduceFirstCardCostEachRound('play', amount, match);
    },
    increaseCost: function(properties) {
        properties.amount = -properties.amount;
        return this.reduceCost(properties);
    },
    skipPhase: function(name) {
        return {
            targetType: 'game',
            apply: function(game) {
                game.skipPhase[name] = true;
            },
            unapply: function(game) {
                game.skipPhase[name] = false;
            }
        };
    },
    lookAtTopCard: function() {
        return {
            targetType: 'player',
            apply: function(player, context) {
                let revealFunc = (card, viewingPlayer) => player.drawDeck.length > 0 && player.drawDeck[0] === card && card.controller === player && viewingPlayer === player;

                context.lookAtTopCard = context.lookAtTopCard || {};
                context.lookAtTopCard[player.name] = revealFunc;
                context.game.cardVisibility.addRule(revealFunc);
            },
            unapply: function(player, context) {
                let revealFunc = context.lookAtTopCard[player.name];

                context.game.cardVisibility.removeRule(revealFunc);
                delete context.lookAtTopCard[player.name];
            }
        };
    },
    revealTopCard: function() {
        return {
            targetType: 'player',
            apply: function(player, context) {
                let revealFunc = (card) => player.drawDeck.length > 0 && player.drawDeck[0] === card;

                context.revealTopCard = context.revealTopCard || {};
                context.revealTopCard[player.name] = revealFunc;
                context.game.cardVisibility.addRule(revealFunc);
                player.flags.add('revealTopCard');
            },
            unapply: function(player, context) {
                let revealFunc = context.revealTopCard[player.name];

                context.game.cardVisibility.removeRule(revealFunc);
                player.flags.remove('revealTopCard');
                delete context.revealTopCard[player.name];
            }
        };
    },
    removeCardsFromHand: function() {
        return {
            targetType: 'player',
            apply: function(player) {
                for(let card of player.hand) {
                    player.removeCardFromPile(card);
                    card.facedown = true;
                }
            },
            unapply: function(player, context) {
                player.discardCards(player.hand);
                for(let card of context.source.childCards.filter(card => card.controller === player && card.location === 'underneath')) {
                    player.moveCard(card, 'hand');
                }
                context.game.addMessage('{0} discards their hand and returns each card under {1} to their hand',
                    player, context.source);
            }
        };
    }
};

module.exports = Effects;
