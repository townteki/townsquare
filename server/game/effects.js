const uuid = require('uuid');

const CardTextDefinition = require('./CardTextDefinition');
const CostReducer = require('./costreducer.js');
const PlayableLocation = require('./playablelocation.js');
const CannotRestriction = require('./cannotrestriction.js');
const ImmunityRestriction = require('./immunityrestriction.js');
const GhostRockSource = require('./GhostRockSource.js');
const CardAction = require('./cardaction');

function cannotEffect(type = 'any', playType = 'any', titleFunc = () => '', targetType = '') {
    return function(controller, predicate) {
        const title = titleFunc(controller === 'opponent' ? ' opponent' : '');
        if(targetType === 'shootout') {
            return shootoutRestrictionEffect(new CannotRestriction(type, playType, controller, predicate), title);
        }
        return cardRestrictionEffect(new CannotRestriction(type, playType, controller, predicate), title);
    };
}

// if specific ability play type cannot be played on card (e.g. shootout, resolution)
function cannotEffectPlayType(playType, titleFunc, targetType = '') {
    return function(controller, predicate) {
        const title = titleFunc(controller === 'opponent' ? ' opponent' : '');
        if(targetType === 'shootout') {
            return shootoutRestrictionEffect(CannotRestriction.forAnyType(playType, predicate, controller), title);
        }
        return cardRestrictionEffect(CannotRestriction.forAnyType(playType, predicate, controller), title);
    };
}

// if specific game actions cannot be played on card (e.g. ace, discard, callout, target)
function cannotEffectType(type, titleFunc, targetType = '') {
    return function(controller, predicate) {
        const title = titleFunc(controller === 'opponent' ? ' opponent' : '');
        if(targetType === 'shootout') {
            return shootoutRestrictionEffect(CannotRestriction.forAnyPlayType(type, predicate, controller), title);
        }
        return cardRestrictionEffect(CannotRestriction.forAnyPlayType(type, predicate, controller), title);
    };
}

function cannotMove(viaCardEffects = false) {
    return function(controller = 'any', predicate = () => true) {
        let titleSuffix = '';
        if(controller === 'opponent') {
            titleSuffix = ' opponent';
        }
        if(viaCardEffects) {
            titleSuffix += ' card effects';
        }
        return {
            title: `Cannot move ${titleSuffix !== '' ? 'by ' + titleSuffix : ''}`,
            apply: function(card, context) {
                context.restrictions = context.restrictions || {};
                context.restrictions[card.uuid] = [];
                context.restrictions[card.uuid].push(new CannotRestriction('moveDude', 'any', controller, context => 
                    (!viaCardEffects || (context.ability && context.ability.isCardAbility())) &&
                    predicate(context)
                ));
                context.restrictions[card.uuid].push(new CannotRestriction('joinPosse', 'any', controller, context => 
                    (!viaCardEffects || (context.ability && context.ability.isCardAbility())) && 
                    card.getType() === 'dude' && card.needToMoveToJoinPosse() &&
                    predicate(context)
                ));
                context.restrictions[card.uuid].push(new CannotRestriction('sendHome', 'any', controller, context => 
                    (!viaCardEffects || (context.ability && context.ability.isCardAbility())) && 
                    card.getType() === 'dude' && !card.isAtHome() &&
                    predicate(context)
                ));
                context.restrictions[card.uuid].forEach(r => card.addAbilityRestriction(r));
            },
            unapply: function(card, context) {
                context.restrictions[card.uuid].forEach(r => card.removeAbilityRestriction(r));
                delete context.restrictions[card.uuid];
            }
        }; 
    }; 
}

function cardRestrictionEffect(restrictions, title) {
    return {
        title,
        apply: function(card) {
            card.addAbilityRestriction(restrictions);
        },
        unapply: function(card) {
            card.removeAbilityRestriction(restrictions);
        }
    }; 
}

function shootoutRestrictionEffect(restrictions, title) {
    return {
        title,
        targetType: 'shootout',
        apply: function(shootout) {
            shootout.addAbilityRestriction(restrictions);
        },
        unapply: function(shootout) {
            shootout.removeAbilityRestriction(restrictions);
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

function optionEffect(key, title) {
    return function(source, condition) {
        return {
            title: title,
            apply: function(card) {
                card.options.add(key, source, condition);
            },
            unapply: function(card) {
                card.options.remove(key, source);
            }
        };
    };
}

function playerOptionEffect(key, title) {
    return function(source, condition) {
        return {
            title: title,
            targetType: 'player',
            apply: function(player) {
                player.options.add(key, source, condition);
            },
            unapply: function(player) {
                player.options.remove(key, source);
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

function conditionalAdjacency(type) {
    return function (condition, source) {
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
                delete context.dynamicAdjacency[card.uuid];
            },
            isStateDependent: true
        };
    };
}

function dynamicStatModifier(propName) {
    return function(calculateOrValue, gameAction) {
        const isStateDependent = (typeof calculateOrValue === 'function');
        const calculate = isStateDependent ? calculateOrValue : () => calculateOrValue;
        const propNameCapital = propName[0].toUpperCase() + propName.slice(1);
        const functionName = 'modify' + propNameCapital;
        const dynamicPropName = 'dynamic' + propNameCapital;

        return {
            title: `${propNameCapital} dynamically modified`,
            gameAction: gameAction || 'increase' + propNameCapital,
            apply: function(card, context) {
                context[dynamicPropName] = context[dynamicPropName] || {};
                context[dynamicPropName][card.uuid] = calculate(card, context) || 0;
                let value = context[dynamicPropName][card.uuid];
                this.title = `${propNameCapital} modified: ${value}`;
                card[functionName](value, true, true);
            },
            reapply: function(card, context) {
                let currentProperty = context[dynamicPropName][card.uuid];
                let newProperty = calculate(card, context) || 0;
                context[dynamicPropName][card.uuid] = newProperty;
                let value = newProperty - currentProperty;
                card[functionName](value, true, true);
            },
            unapply: function(card, context) {
                let value = context[dynamicPropName][card.uuid];
                card[functionName](-value, false, true);
                delete context[dynamicPropName][card.uuid];
            },
            isStateDependent
        };
    };
}

const Effects = {
    setAsStud: function() {
        return {
            title: 'Stud bullet modifier',
            gameAction: 'setAsStud',
            apply: function(card, context) {
                if(card.getType() === 'dude') {
                    if(!context.source) {
                        context.source = { uuid: uuid.v1() };
                    }
                    card.addStudEffect(context.source.uuid, 'Stud');
                }
            },
            unapply: function(card, context) {
                if(card.getType() === 'dude') {
                    card.removeStudEffect(context.source.uuid);
                }
            }
        };
    },
    setAsDraw: function() {
        return {
            title: 'Draw bullet modifier',
            gameAction: 'setAsDraw',
            apply: function(card, context) {
                if(card.getType() === 'dude') {
                    if(!context.source) {
                        context.source = { uuid: uuid.v1() };
                    }
                    card.addStudEffect(context.source.uuid, 'Draw');
                }
            },
            unapply: function(card, context) {
                if(card.getType() === 'dude') {
                    card.removeStudEffect(context.source.uuid);
                }
            }
        };
    },
    setMaxBullets: function(value) {
        return {
            title: `Set Max Bullets to ${value}`,
            apply: function(card, context) {
                context.setMaxBullets = context.setMaxBullets || {};
                context.setMaxBullets[card.uuid] = card.maxBullets;
                card.maxBullets = value;
            },
            unapply: function(card, context) {
                card.maxBullets = context.setMaxBullets[card.uuid];
                delete context.setMaxBullets[card.uuid];
            }
        };
    },
    determineControlByBullets: function() {
        return {
            title: 'Control Determinator: Bullets',
            apply: function(card) {
                card.controlDeterminator = 'bullets';
            },
            unapply: function(card) {
                card.controlDeterminator = 'influence:deed';
            }
        };
    }, 
    setSuit: function(suit, sourceUuid) {
        return {
            title: `Suit set to: ${suit}`,
            gameAction: 'setSuit',
            apply: function(card) {
                card.addSuitEffect(sourceUuid, suit);
            },
            unapply: function(card) {
                card.removeSuitEffect(sourceUuid, suit);
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
    calloutCannotBeRefused: optionEffect('calloutCannotBeRefused', 'Callout cannot be Refused'),
    cannotRefuseCallout: optionEffect('cannotRefuseCallout', 'Cannot refuse callouts'),
    doesNotGetBountyOnJoin: optionEffect('doesNotGetBountyOnJoin', 'Does not get Bounty on Join'),
    doesNotUnbootAtSundown: optionEffect('doesNotUnbootAtSundown', 'Does not Unboot at Sundown'),
    doesNotProvideBulletRatings: optionEffect('doesNotProvideBulletRatings', 'Does not provide Bullets'),
    doesNotReturnAfterJob: optionEffect('doesNotReturnAfterJob', 'Does not go Home after Job'),
    restrictAttachmentsTo: function(trait) {
        return Effects.addKeyword(`No attachments except <i>${trait}</i>`);
    },
    modifyBullets: function(value) {
        return {
            title: `Bullets modified: ${value}`,
            gameAction: value < 0 ? 'decreaseBullets' : 'increaseBullets',
            apply: function(card) {
                card.modifyBullets(value, true, true);
            },
            unapply: function(card) {
                card.modifyBullets(-value, false, true);
            }
        };
    },
    setBullets: function(value) {
        return {
            title: `Bullets set to: ${value}`,
            gameAction: card => card.bullets > value ? 'decreaseBullets' : 'increaseBullets',
            apply: function(card, context) {
                context.changeAmount = context.changeAmount || {};
                context.changeAmount[card.uuid] = value - card.bullets;
                card.modifyBullets(context.changeAmount[card.uuid], true, true);
            },
            unapply: function(card, context) {
                card.modifyBullets(context.changeAmount[card.uuid] * -1, false, true);
                delete context.changeAmount[card.uuid];
            }
        };
    },
    modifyInfluence: function(value) {
        return {
            title: `Influence modified: ${value}`,
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
        return {
            title: `Influence set to: ${value}`,
            gameAction: card => card.influence > value ? 'decreaseInfluence' : 'increaseInfluence',
            apply: function(card, context) {
                context.changeAmount = context.changeAmount || {};
                context.changeAmount[card.uuid] = value - card.influence;
                card.modifyInfluence(context.changeAmount[card.uuid], true);
            },
            unapply: function(card, context) {
                card.modifyInfluence(context.changeAmount[card.uuid] * -1);
                delete context.changeAmount[card.uuid];
            }
        };
    },
    modifyControl: function(value) {
        return {
            title: `Control modified: ${value}`,
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
        return {
            title: `Control set to: ${value}`,
            gameAction: card => card.control > value ? 'decreaseControl' : 'increaseControl',
            apply: function(card, context) {
                context.changeAmount = context.changeAmount || {};
                context.changeAmount[card.uuid] = value - card.control;
                card.modifyControl(context.changeAmount[card.uuid], true);
            },
            unapply: function(card, context) {
                card.modifyControl(context.changeAmount[card.uuid] * -1, false);
                delete context.changeAmount[card.uuid];
            }
        };
    },
    modifyValue: function(value) {
        return {
            title: `Value modified: ${value}`,
            gameAction: value < 0 ? 'decreaseValue' : 'increaseValue',
            apply: function(card) {
                card.modifyValue(value, true);
            },
            unapply: function(card) {
                card.modifyValue(-value, false);
            }
        };
    },
    setValue: function(value) {
        return {
            title: `Value set to: ${value}`,
            gameAction: card => card.value > value ? 'decreaseValue' : 'increaseValue',
            apply: function(card, context) {
                context.changeAmount = context.changeAmount || {};
                context.changeAmount[card.uuid] = value - card.value;
                card.modifyValue(context.changeAmount[card.uuid], true);
            },
            unapply: function(card, context) {
                card.modifyValue(context.changeAmount[card.uuid] * -1);
                delete context.changeAmount[card.uuid];
            }
        };
    },
    modifyProduction: function(value) {
        return {
            title: `Production modified: ${value}`,
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
            title: `Upkeep modified: ${value}`,
            gameAction: value < 0 ? 'decreaseUpkeep' : 'increaseUpkeep',
            apply: function(card) {
                card.modifyUpkeep(value, true);
            },
            unapply: function(card) {
                card.modifyUpkeep(-value, false);
            }
        };
    },
    modifySkillRating: function(type, value) {
        return {
            title: `Skill Rating modified: ${value}`,
            gameAction: value < 0 ? 'decreaseSkill' + type : 'increaseSkill' + type,
            apply: function(card) {
                card.modifySkillRating(type, value, true);
            },
            unapply: function(card) {
                card.modifySkillRating(type, -value, false);
            }
        };
    },
    dynamicSkillRating: function(type, skillRatingFunc) {
        return {
            title: `${type[0].toUpperCase() + type.slice(1)} rating modified`,
            apply: function(card, context) {
                context.dynamicSkillRating = context.dynamicSkillRating || {};
                context.dynamicSkillRating[card.uuid] = skillRatingFunc(card, context) || [];
                let value = context.dynamicSkillRating[card.uuid];
                card.modifySkillRating(type, value);
            },
            reapply: function(card, context) {
                let currentProperty = context.dynamicSkillRating[card.uuid];
                let newProperty = skillRatingFunc(card, context) || 0;
                context.dynamicSkillRating[card.uuid] = newProperty;
                let value = newProperty - currentProperty;
                card.modifySkillRating(type, value);
            },
            unapply: function(card, context) {
                let value = context.dynamicSkillRating[card.uuid];
                card.modifySkillRating(type, -value);
                delete context.dynamicSkillRating[card.uuid];
            },
            isStateDependent: true
        };
    },
    modifyPlayerControl: function(value) {
        return {
            title: `Player Control modified: ${value}`,
            apply: function(player) {
                player.control += value;
            },
            unapply: function(player) {
                player.control -= value;
            }
        };
    },
    productionToBeReceivedBy: function(player) {
        return {
            title: `Production to be received by: ${player.name}`,
            apply: function(card) {
                if(card.getType() === 'deed') {
                    card.productionToBeReceivedBy = player;
                }
            },
            unapply: function(card) {
                card.productionToBeReceivedBy = null;
            }
        };
    },
    additionalDynamicAdjacency: conditionalAdjacency('adjacent'),
    preventDynamicAdjacency: conditionalAdjacency('prevent'),
    additionalAdjacency: adjacency('adjacent'),
    preventAdjacency: adjacency('prevent'),
    dynamicBullets: dynamicStatModifier('bullets'),
    dynamicInfluence: dynamicStatModifier('influence'),
    dynamicValue: dynamicStatModifier('value'),
    dynamicProduction: dynamicStatModifier('production'),
    dynamicUpkeep: dynamicStatModifier('upkeep'),
    modifyHandSize: function(value) {
        return {
            title: `Hand Size modified: ${value}`,
            targetType: 'player',
            apply: function(player) {
                player.handSize += value;
            },
            unapply: function(player) {
                player.handSize -= value;
            }
        };
    },
    modifySundownDiscard: function(value) {
        return {
            title: `Sundown Discard modified: ${value}`,
            targetType: 'player',
            apply: function(player) {
                player.discardNumber += value;
            },
            unapply: function(player) {
                player.discardNumber -= value;
            }
        };
    },
    modifyHandRankMod: function(value) {
        return {
            title: `Hand Rank modified: ${value}`,
            targetType: 'player',
            gameAction: 'modifyHandRank',
            apply: function(player, context) {
                player.modifyRank(value, context, true);
            },
            unapply: function(player, context) {
                player.modifyRank(-value, context, false);
            }
        };
    },
    dynamicHandRankMod: function(calculateOrValue) {
        const isStateDependent = (typeof calculateOrValue === 'function');
        const calculate = isStateDependent ? calculateOrValue : () => calculateOrValue;

        return {
            title: 'Hand Rank dynamically modified',
            gameAction: 'modifyHandRank',
            apply: function(player, context) {
                context.dynamicHandRank = context.dynamicHandRank || {};
                context.dynamicHandRank[player.name] = calculate(player, context) || 0;
                let value = context.dynamicHandRank[player.name];
                this.title = `Hand Rank modified: ${value}`;
                player.modifyRank(value, context, true);
            },
            reapply: function(player, context) {
                let currentProperty = context.dynamicHandRank[player.name];
                let newProperty = calculate(player, context) || 0;
                context.dynamicHandRank[player.name] = newProperty;
                let value = newProperty - currentProperty;
                player.modifyRank(value, context, true);
            },
            unapply: function(player, context) {
                let value = context.dynamicHandRank[player.name];
                player.modifyRank(-value, context, false);
                delete context.dynamicHandRank[player.name];
            },
            isStateDependent
        };
    },
    addKeyword: function(keyword) {
        return {
            title: `Keyword added: ${keyword}`,
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
            title: `Keyword removed: ${keyword}`,
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
            title: `Keywords added: ${keywords}`,
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
    addCardAction: function(properties) {
        return {
            title: `Card Action added: ${properties.title}`,
            apply: function(card, context) {
                let action = new CardAction(context.game, card, properties);
                context.cardActionIndex = context.cardActionIndex || {};
                context.cardActionIndex[card.uuid] = card.abilities.actions.push(action) - 1;
                action.registerEvents();
            },
            unapply: function(card, context) {
                let action = card.abilities.actions[context.cardActionIndex[card.uuid]];
                action.unregisterEvents();
                card.abilities.actions.splice(context.cardActionIndex[card.uuid], 1);
                delete context.cardActionIndex[card.uuid];
            }
        };
    },
    addSkillKfBonus: function(bonus, source) {
        return {
            title: 'Skill or KF bonus added',
            apply: function(card) {
                if(card.getType() === 'dude') {
                    card.addSkillKfBonus(bonus, source);
                }
            },
            unapply: function(card) {
                if(card.getType() === 'dude') {
                    card.removeSkillKfBonus(source);
                }
            }
        };        
    },
    blankExcludingKeywords: {
        title: 'Blank excluding Keywords',
        apply: function(card) {
            card.setBlank('excludingKeywords');
        },
        unapply: function(card) {
            card.clearBlank('excludingKeywords');
        }
    },
    fullBlank: {
        title: 'Full Blank',
        apply: function(card) {
            card.setBlank('full');
        },
        unapply: function(card) {
            card.clearBlank('full');
        }
    },
    traitBlank: {
        title: 'Trait Blank',
        apply: function(card) {
            card.setBlank('trait');
        },
        unapply: function(card) {
            card.clearBlank('trait');
        }
    },
    bulletBonusBlank: {
        title: 'Bullet Bonus Blank',
        apply: function(card) {
            card.setBlank('bulletBonuses');
        },
        unapply: function(card) {
            card.clearBlank('bulletBonuses');
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
            title: `Control taken by: ${newController.name}`,
            apply: function(card, context) {
                let finalController = typeof newController === 'function' ? newController() : newController;
                context.originalController = context.originalController || {};
                context.originalController[card.uuid] = card.controller;
                context.game.takeControl(finalController, card, context.source);
            },
            unapply: function(card, context) {
                context.game.revertControl(card, context.originalController[card.uuid]);
                delete context.originalController[card.uuid];
            }
        };
    },
    gainText: function(configureText) {
        const definition = new CardTextDefinition();
        configureText(definition);
        return definition;
    },
    cannotBeMoved: cannotMove(false),
    cannotBeMovedViaCardEffects: cannotMove(true),
    cannotBeSentHome: 
        cannotEffectType('sendHome', opponent => `Cannot be sent home${opponent ? ' by' + opponent : ''}`),
    cannotBeSentHomeByShootout: 
        cannotEffect('sendHome', 'shootout', opponent => `Cannot be sent home by${opponent} shootout`),
    cannotLeaveShootout: 
        cannotEffectType('removeFromPosse', () => 'Cannot leave shootout'),
    cannotBeCalledOut: 
        cannotEffectType('callout', opponent => `Cannot be called out${opponent ? ' by' + opponent : ''}`),
    cannotBeAced: 
        cannotEffectType('ace', opponent => `Cannot be aced${opponent ? ' by' + opponent : ''}`),
    cannotBeDiscarded: 
        cannotEffectType('discard', opponent => `Cannot be discarded${opponent ? ' by' + opponent : ''}`),
    cannotBeBooted: 
        cannotEffectType('boot', opponent => `Cannot be booted${opponent ? ' by' + opponent : ''}`),
    cannotIncreaseBullets: 
        cannotEffectType('increaseBullets', opponent => `Cannot have bullets increased${opponent ? ' by' + opponent : ''}`),
    cannotDecreaseBullets: 
        cannotEffectType('decreaseBullets', opponent => `Cannot have bullets decreased${opponent ? ' by' + opponent : ''}`),
    cannotDecreaseBulletsByShootout: 
        cannotEffect('decreaseBullets', 'shootout', opponent => `Cannot have bullets decreased by${opponent} shootout`),        
    cannotBeSetToDraw: 
        cannotEffectType('setAsDraw', opponent => `Cannot be set to draw${opponent ? ' by' + opponent : ''}`),
    cannotBeSetToDrawByShootout: 
        cannotEffect('setAsDraw', 'shootout', opponent => `Cannot be set to draw by${opponent} shootout`),  
    cannotIncreaseInfluence: 
        cannotEffectType('increaseInfluence', opponent => `Cannot have influence increased${opponent ? ' by' + opponent : ''}`),      
    cannotDecreaseInfluence: 
        cannotEffectType('decreaseInfluence', opponent => `Cannot have influence decreased${opponent ? ' by' + opponent : ''}`),
    cannotIncreaseControl: 
        cannotEffectType('increaseControl', opponent => `Cannot have control increased${opponent ? ' by' + opponent : ''}`),      
    cannotDecreaseControl: 
        cannotEffectType('decreaseControl', opponent => `Cannot have control decreased${opponent ? ' by' + opponent : ''}`),
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
    cannotBeAffected: 
        cannotEffect('any', 'any', opponent => `Cannot be affected${opponent ? ' by' + opponent : ''}`),
    cannotBeAffectedByShootout: 
        cannotEffectPlayType('shootout', opponent => `Cannot be affected by${opponent} shootout`),
    cannotBeTargetedByShootout: 
        cannotEffect('target', 'shootout', opponent => `Cannot be targeted by${opponent} shootout`),
    cannotBeTargeted: 
        cannotEffectType('target', opponent => `Cannot be targeted${opponent ? ' by' + opponent : ''}`),
    cannotTriggerPlayerAbilities: function(restriction = () => true) {
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
    cannotTriggerCardAbilities: function(abilityFunc = () => true) {
        return {
            title: 'Cannot trigger Card abilities',
            apply: function(card) {
                card.updateAbilitiesBlanking(abilityFunc, true);
            },
            unapply: function(card) {
                card.updateAbilitiesBlanking(abilityFunc, false);
            }
        };
    },
    ignoreBulletModifiers: function(controller = 'any', predicate = () => true) {
        return {
            title: `Ignores bullet modifiers${controller === 'opponent' ? ' by opponent' : ''}`,
            apply: function(card, context) {
                context.restrictions = context.restrictions || {};
                context.restrictions[card.uuid] = [];
                context.restrictions[card.uuid].push(new CannotRestriction('increaseBullets', 'any', controller, context => predicate(context)));
                context.restrictions[card.uuid].push(new CannotRestriction('decreaseBullets', 'any', controller, context => predicate(context)));
                context.restrictions[card.uuid].push(new CannotRestriction('setAsStud', 'any', controller, context => predicate(context)));
                context.restrictions[card.uuid].push(new CannotRestriction('setAsDraw', 'any', controller, context => predicate(context)));
                context.restrictions[card.uuid].forEach(r => card.addAbilityRestriction(r));
                card.game.updateEffectsOnCard(card, effect => effect.gameAction === 'increaseBullets' || effect.gameAction === 'decreaseBullets' ||
                    effect.gameAction === 'setAsStud' || effect.gameAction === 'setAsDraw');
            },
            unapply: function(card, context) {
                context.restrictions[card.uuid].forEach(r => card.removeAbilityRestriction(r));
                delete context.restrictions[card.uuid];
            }
        }; 
    },
    cannotModifyHandRanks: 
        playerOptionEffect('cannotModifyHandRanks', 'Hand ranks cannot be modified'),
    switchBulletBonuses:
        playerOptionEffect('bulletBonusesSwitched', 'Bullet bonuses are switched'),
    dudesCannotFlee: 
        playerOptionEffect('dudesCannotFlee', 'Dudes cannot flee shootout'),
    onlyShooterContributes:
        playerOptionEffect('onlyShooterContributes', 'Only shooter contributes'),
    modifyPosseStudBonus: function(amount) {
        return {
            title: `Stud Bonus modified: ${amount}`,
            targetType: 'player',
            apply: function(player) {
                player.modifyPosseStudBonus(amount);
            },
            unapply: function(player) {
                player.modifyPosseStudBonus(-amount);
            }
        };
    },
    modifyPosseShooterBonus: function(amount) {
        return {
            title: `Shooter Bonus modified: ${amount}`,
            targetType: 'player',
            apply: function(player) {
                player.modifyPosseShooterBonus(amount);
            },
            unapply: function(player) {
                player.modifyPosseShooterBonus(-amount);
            }
        };
    },
    addRedrawBonus: function(amount) {
        return {
            title: `Redraw Bonus modified: ${amount}`,
            targetType: 'player',
            apply: function(player) {
                player.redrawBonus += amount;
            },
            unapply: function(player) {
                player.redrawBonus -= amount;
            }
        };
    },
    modifyLoserCasualties: function(amount) {
        return {
            title: `Loser Casualties modified: ${amount}`,
            targetType: 'shootout',
            apply: function(shootout) {
                shootout.loserCasualtiesMod += amount;
            },
            unapply: function(shootout) {
                shootout.loserCasualtiesMod -= amount;
            }
        };
    },
    useInfluenceForShootout: function() {
        return {
            title: 'Stud/Draw bonus determined by Influence',
            targetType: 'shootout',
            apply: function(shootout) {
                shootout.useInfluence = true;
            },
            unapply: function(shootout) {
                shootout.useInfluence = false;
            }
        };
    },
    selectAsFirstCasualty:
        optionEffect('isSelectedAsFirstCasualty', 'Has to be First Casualty'),
    cannotBringDudesIntoPosseByShootout: 
        cannotEffectPlayType('shootout:join', opponent => `Cannot bring dudes to posse by${opponent} shootout`, 'shootout'),
    cannotBeChosenAsCasualty:
        optionEffect('cannotBeChosenAsCasualty', 'Cannot be chosen as Casualty'),
    cannotBeTraded:
        optionEffect('cannotBeTraded', 'Cannot be Traded'),
    cannotFlee:
        optionEffect('cannotFlee', 'Cannot Flee'),
    cannotAttachCards:
        optionEffect('cannotAttachCards', 'Cannot Attach Cards'),
    canRefuseWithoutGoingHomeBooted:
        optionEffect('canRefuseWithoutGoingHomeBooted', 'Can Refuse without going Home'),
    canMoveWithoutBooting:
        optionEffect('canMoveWithoutBooting', 'Can Move without Booting'),
    canJoinWithoutBooting:
        optionEffect('canJoinWithoutBooting', 'Can Join without Booting'),
    canJoinWithoutMoving:
        optionEffect('canJoinWithoutMoving', 'Can Join without Moving'),
    canJoinWhileBooted:
        optionEffect('canJoinWhileBooted', 'Can Join while Booted'),
    canBeInventedWithoutBooting:
        optionEffect('canBeInventedWithoutBooting', 'Can be Invented without Booting'),
    canBeCalledOutAtHome:
        optionEffect('canBeCalledOutAtHome', 'Can be Called out at Home'),
    canUseControllerAbilities:
        optionEffect('canUseControllerAbilities', 'Can use Controller Abilities'),
    canPerformSkillUsing: function(skillnameOrKF, condition) {
        var getSkillRatingFunc;
        return {
            title: `Can perform other skills using ${skillnameOrKF}`,
            apply: function(card) {
                getSkillRatingFunc = card.getSkillRatingForCard;
                card.getSkillRatingForCard = spellOrGadget => {
                    if(condition(spellOrGadget)) {
                        return card.getSkillRating(skillnameOrKF);
                    }
                };
            },
            unapply: function(card) {
                card.getSkillRatingForCard = getSkillRatingFunc;
            }
        };
    },
    canPerformTechniqueUsing: function(skillname, condition = () => true) {
        var getKfRatingFunc;
        return {
            title: `Can perform Technique using ${skillname}`,
            apply: function(card) {
                getKfRatingFunc = card.getKungFuRating;
                card.getKungFuRating = technique => {
                    if(condition(technique)) {
                        return card.getSkillRating(skillname);
                    }
                };
            },
            unapply: function(card) {
                card.getKungFuRating = getKfRatingFunc;
            }
        };
    },
    canSpendGhostRock: function(allowSpendingFunc) {
        return {
            apply: function(card, context) {
                let ghostrockSource = new GhostRockSource(card, allowSpendingFunc);
                context.canSpendGhostRock = context.canSpendGhostRock || {};
                context.canSpendGhostRock[card.uuid] = ghostrockSource;
                card.controller.addGhostRockSource(ghostrockSource);
            },
            unapply: function(card, context) {
                let ghostrockSource = context.canSpendGhostRock[card.uuid];
                card.controller.removeGhostRockSource(ghostrockSource);
                delete context.canSpendGhostRock[card.uuid];
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
    changeWeaponLimitFunction: function(weaponLimitFunc) {
        var savedFunc;
        return {
            apply: function(card) {
                savedFunc = card.checkWeaponLimit;
                card.checkWeaponLimit = () => {
                    return weaponLimitFunc();
                };
            },
            unapply: function(card) {
                card.checkWeaponLimit = savedFunc;
            }
        };
    },
    setGritFunc: function(func) {
        return {
            apply: function(card, context) {
                context.setGritFunc = context.setGritFunc || {};
                context.setGritFunc[card.uuid] = card.gritFunc;
                card.gritFunc = func;
            },
            unapply: function(card, context) {
                card.gritFunc = context.setGritFunc[card.uuid];
                delete context.setGritFunc[card.uuid];
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
        properties.isIncrease = true;
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
    }
};

module.exports = Effects;
