const TextHelper = require('./TextHelper');
const Deck = require('./Deck');
const RematchPrompt = require('./gamesteps/RematchPrompt');
const {Tokens} = require('./Constants');

class ChatCommands {
    constructor(game) {
        this.game = game;
        this.commands = {
            '/ace': this.ace,
            '/add-keyword': this.addKeyword,
            '/addkey': this.addKeyword,
            '/add-card': this.addCard,
            '/attach': this.attach,
            '/bullets': this.bullets,
            '/bul': this.bullets,
            '/blank': this.blank,
            '/bounty': this.bounty,
            '/cancel-prompt': this.cancelPrompt,
            '/canpr': this.cancelPrompt,
            '/cancel-shootout': this.cancelShootout,
            '/canshoot': this.cancelShootout,
            '/clear-shooter': this.clearShooter,
            '/clshoot': this.clearShooter,
            '/clear-suit': this.clearSuit,
            '/clsuit': this.clearSuit,
            '/clear-effects': this.clearEffects,
            '/cleff': this.clearEffects,
            '/control': this.control,
            '/done': this.done,
            '/discard-random': this.discardRandom,
            '/discard-deck': this.discardFromDeck,
            '/disconnectme': this.disconnectMe,
            '/draw': this.draw,
            '/give-control': this.giveControl,
            '/hand-rank': this.handRank,
            '/hr': this.handRank,
            '/inf': this.influence,
            '/join': this.joinPosse,
            '/join-posse': this.joinPosse,
            '/join-without-move': this.joinPosseWoMove,
            '/kung-fu': this.kungFuRating,
            '/look-deck': this.lookAtDeck,
            '/move': this.move,
            '/pass': this.pass,
            '/prod': this.prod,
            '/pull': this.pull,
            '/rematch': this.rematch,
            '/remove-from-game': this.removeFromGame,
            '/remove-from-posse': this.removeFromPosse,
            '/rmfp': this.removeFromPosse,
            '/remove-keyword': this.removeKeyword,
            '/rmkey': this.removeKeyword,
            '/reset-abilities': this.resetAbilities,
            '/resab': this.resetAbilities,
            '/reset-stats': this.resetStats,
            '/reveal-hand': this.revealHand,
            '/reveal-deck': this.revealDeck,
            '/shooter': this.shooter,
            '/shuffle-discard': this.shuffleDiscard,
            '/skill-rating': this.skillRating,
            '/skill': this.skillRating,
            '/suit': this.suit,
            '/token': this.setToken,
            '/use': this.useAbility,
            '/unblank': this.unblank,
            '/value': this.value
        };
    }

    executeCommand(player, command, args) {
        if(!player || !this.commands[command]) {
            return false;
        }

        const result = this.commands[command].call(this, player, args);
        this.game.raiseEvent('onChatCommandCall', { command });
        return result !== false;
    }

    draw(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);

        this.game.addAlert('danger', '{0} uses the /draw command to draw {1} cards to their hand', player, num);

        player.drawCardsToHand(num);
    }

    bullets(player, args) {
        var modifier = this.determineModifier(args[1]);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set bullets for',
            waitingPromptTitle: 'Waiting for opponent to set bullets',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude', 'goods'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'modify bullets (' + modifier.text + ')', () => {
                    let bullets = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        bullets = modifier.set - card.bullets;
                    }
                    card.bullets += bullets;
                    this.game.addAlert('danger', '{0} uses the /bullets command to set the bullets of {1} to {2}', p, card, card.bullets);
                });
                return true;
            }
        });
    }

    bounty(player, args) {
        var modifier = this.determineModifier(args[1]);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set bounty for',
            waitingPromptTitle: 'Waiting for opponent to set bounty',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'modify bounty (' + modifier.text + ')', () => {
                    let change = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        change = modifier.set - card.bounty;
                    }
                    if(change < 0) {
                        card.decreaseBounty(change * -1);
                    } else {
                        card.increaseBounty(change);
                    }
    
                    this.game.addAlert('danger', '{0} uses the /bounty command to set the bounty of {1} to {2}', p, card, card.bounty);
                });
                return true;
            }
        });
    }

    influence(player, args) {
        var modifier = this.determineModifier(args[1]);
        var type = args[2] || 'influence';
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set ' + type + ' for',
            waitingPromptTitle: 'Waiting for opponent to set ' + type,
            cardCondition: card => card.location === 'play area',
            cardType: ['dude', 'goods'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'modify influence (' + modifier.text + ')', () => {
                    // TODO M2 so far we only use standard influence, no influence:deed
                    let influence = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        influence = modifier.set - card.influence;
                    }
                    card.influence += influence;
                    this.game.addAlert('danger', '{0} uses the /influence command to set the influence of {1} to {2}', p, card, card.influence);
                });
                return true;
            }
        });
    }

    control(player, args) {
        var modifier = this.determineModifier(args[1]);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set control for',
            waitingPromptTitle: 'Waiting for opponent to set control',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude', 'deed', 'goods', 'spell', 'outfit'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'modify control points (' + modifier.text + ')', () => {
                    let control = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        control = modifier.set - card.control;
                    }
                    card.control += control;
                    this.game.addAlert('danger', '{0} uses the /control command to set the control of {1} to {2}', p, card, card.control);
                });                
                return true;
            }
        });
    }

    handRank(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        let totalRank = player.getHandRank().rank + player.rankModifier;
        let change = num - totalRank;
        player.modifyRank(change);
        this.game.addAlert('danger', '{0} uses the /hand-rank command to set their hand rank to {1}', 
            player, player.getTotalRank());
    }

    pass(player) {
        if(this.game.currentPlayWindow && this.game.currentPlayWindow.name !== 'gambling') {
            this.game.currentPlayWindow.onPass(player);
        }
    }

    done(player) {
        if(this.game.currentPlayWindow && this.game.currentPlayWindow.name !== 'gambling') {
            this.game.currentPlayWindow.onDone(player);
        }
    }

    pull(player, args) {
        let condition = args[1] === 'kf' ? card => card.isKungFu() : card => card.isSkilled();
        var num = this.getNumberOrDefault(args[1], 0);
        if(!num && args[1] !== 'kf') {
            player.handlePulledCard(player.pull(() => true, true));
            return;
        }
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude performing pull',
            waitingPromptTitle: 'Waiting for opponent to select dude performing pull',
            cardCondition: card => card.location === 'play area' && 
                card.controller === player &&
                condition(card),
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.pullingDude = card;
                this.pullDifficulty = num;
                if(player.unscriptedCardPlayed) {
                    player.unscriptedPull = {
                        pullingDude: card
                    };
                }
                let skillsOrFu = args[1] !== 'kf' ? card.getSkills() : ['kung fu'];
                if(skillsOrFu.length > 1) {
                    let buttons = skillsOrFu.map(skill => {
                        return { text: skill.charAt(0).toUpperCase() + skill.slice(1), arg: skill, method: 'selectSkillOrFu' };
                    });
                    this.game.promptWithMenu(p, this, {
                        activePrompt: {
                            menuTitle: 'Select skill',
                            buttons: buttons
                        },
                        source: this
                    });
                } else {
                    this.selectSkillOrFu(p, skillsOrFu[0]);
                }
                return true;
            }
        });
    }

    prod(player, args) {
        var modifier = this.determineModifier(args[1]);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set production for',
            waitingPromptTitle: 'Waiting for opponent to set production',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude', 'goods', 'deed', 'outfit'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'modify production (' + modifier.text + ')', () => {
                    let prod = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        prod = modifier.set - card.production;
                    }
                    card.production += prod;
                    this.game.addAlert('danger', '{0} uses the /prod command to set the production of {1} to {2}', 
                        p, card, card.production);
                }); 
                return true;
            }
        });
    }    

    resetAbilities(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to reset ability for',
            waitingPromptTitle: 'Waiting for opponent to reset ability',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude', 'deed', 'goods', 'spell', 'action', 'outfit', 'legend'],
            onSelect: (p, card) => {
                card.resetAbilities();
                this.game.addAlert('danger', '{0} uses the /reset-ability command to reset abilities for card {1}', p, card);
                return true;
            }
        });        
    }

    skillRating(player, args) {
        var skillName = args[1];
        if(!skillName) {
            return;
        }
        if(skillName === 'mad') {
            skillName = 'mad scientist';
        }
        var modifier = this.determineModifier(args[2]);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to modify skill/kung fu rating for',
            waitingPromptTitle: 'Waiting for opponent to select card',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.handleAction(p, card, `modify ${skillName} rating (${modifier.text})`, () => {
                    const currentRating = card.keywords.getSkillRating(skillName);
                    if(currentRating === null || currentRating === undefined) {
                        this.game.addAlert('danger', '{0} uses the /skill-rating or /kung-fu, but {1} is missing {2}. First add it using /add-keyword', 
                            p, card, skillName);     
                        return true;               
                    }
                    let change = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        change = modifier.set - currentRating;
                    }
                    card.keywords.modifySkillRating(skillName, change);
                    if(skillName !== 'kung fu') {
                        this.game.addAlert('danger', '{0} uses the /skill-rating command to set {1} rating of {2} to {3}', 
                            p, skillName, card, card.keywords.getSkillRating(skillName));
                    } else {
                        this.game.addAlert('danger', '{0} uses the /kung-fu command to set {1} rating of {2} to {3}', 
                            p, skillName, card, card.keywords.getSkillRating(skillName));                    
                    }
                }); 
                return true;
            }
        });
    }

    kungFuRating(player, args) {
        this.skillRating(player, [null, 'kung fu', args[1]]);
    }

    shooter(player, args) {
        var type = args[1];
        if(!type || type === 'stud') {
            type = 'Stud';
        }
        if(type === 'draw') {
            type = 'Draw';
        }
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude to set shooter type for',
            waitingPromptTitle: 'Waiting for opponent to set shooter type',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.handleAction(p, card, `set as ${type}`, () => {
                    card.addStudEffect('chatcommand', type);
                    this.game.addAlert('danger', '{0} uses the /shooter command to set the {1} to {2}', p, card, type);
                }); 
                return true;
            }
        });
    }

    clearShooter(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude to clear chatcommand shooter type for',
            waitingPromptTitle: 'Waiting for opponent to clear shooter type',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude'],
            onSelect: (p, card) => {
                card.removeStudEffect('chatcommand');
                this.game.addAlert('danger', '{0} uses the /clear-shooter command to clear chatcommand shooter type for {1}', p, card);
                return true;
            }
        });        
    }

    suit(player, args) {
        var type = args[1];
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set suit for',
            waitingPromptTitle: 'Waiting for opponent to set suit',
            cardCondition: card => ['play area', 'draw hand'].includes(card.location),
            cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
            onSelect: (p, card) => {
                this.handleAction(p, card, `modify suit (${type})`, () => {
                    card.addSuitEffect('chatcommand', type);
                    this.game.addAlert('danger', '{0} uses the /suit command to set the {1} to {2}', p, card, type);
                }); 
                return true;
            }
        });
    }

    clearSuit(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to clear chatcommand suit for',
            waitingPromptTitle: 'Waiting for opponent to clear suit',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            onSelect: (p, card) => {
                card.removeSuitEffect('chatcommand');
                this.game.addAlert('danger', '{0} uses the /clear-suit command to clear chatcommand suit for {1}', p, card);
                return true;
            }
        });        
    }

    ace(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to ace card',
            cardCondition: card => ['hand', 'draw hand', 'discard pile', 'play area'].includes(card.location),
            cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'ace', () => {
                    card.controller.aceCard(card);
                    this.game.addAlert('danger', '{0} uses the /ace command to ace {1}', p, card);
                });
                return true;
            }
        });
    }

    joinPosse(player, doMove = true) {
        if(!this.game.shootout) {
            return;
        }
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude to join posse',
            waitingPromptTitle: 'Waiting for opponent to select dude to join posse',
            cardCondition: card => card.location === 'play area' && !card.isParticipating(),
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'join to posse', () => {
                    this.game.shootout.addToPosse(card);
                    let actionText = 'add';
                    if(doMove) {
                        card.moveToShootoutLocation({ needToBoot: false, allowBooted: true });
                        actionText = 'move';
                    }
                    this.game.addAlert('danger', '{0} uses the /join-posse command to {1} {2} to posse', p, actionText, card);
                }); 
                return true;
            }
        });
    }

    joinPosseWoMove(player) {
        this.joinPosse(player, false);
    }

    move(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude to move',
            waitingPromptTitle: 'Waiting for opponent to select dude to move',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.game.promptForLocation(p, {
                    activePromptTitle: 'Select where to move ' + card.title,
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    onSelect: (player, location) => {
                        this.handleAction(p, card, `move to ${location.title}`, () => {
                            player.moveDude(card, location.uuid, {
                                isCardEffect: false,
                                needToBoot: false,
                                allowBooted: true
                            });    
                            this.game.addAlert('danger', '{0} uses the /move command to move {1} to {2}', p, card, location);   
                        });                          
                        return true;
                    }
                });
                return true;
            }
        });
    }

    removeFromPosse(player) {
        if(!this.game.shootout) {
            return;
        }
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude to remove from posse',
            waitingPromptTitle: 'Waiting for opponent to select dude to remove from posse',
            cardCondition: card => card.location === 'play area' && card.isParticipating(),
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'remove from posse', () => {
                    this.game.shootout.removeFromPosse(card);
                    this.game.addAlert('danger', '{0} uses the /remove-from-posse command to remove {1} from posse', p, card);
                });  
                return true;
            }
        });
    }  

    blank(player, args) {
        var blankType = args[1];
        if(!blankType) {
            blankType = 'full';
        }
        const blankBonuses = ['bulletBonuses', 'infBonuses'].includes(blankType);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to blank card',
            cardCondition: card => card.location === 'play area' && 
                (!blankBonuses || card.getType() === 'goods'),
            onSelect: (p, card) => {
                this.handleAction(p, card, 'blank', () => {
                    card.setBlank(blankType);
                    this.game.addAlert('danger', '{0} uses the /blank command to blank {1} (type "{2}")', p, card, blankType);
                });                     
                return true;
            }
        });
    }

    unblank(player, args) {
        var blankType = args[1];
        if(!blankType) {
            blankType = 'full';
        }
        const blankBonuses = ['bulletBonuses', 'infBonuses'].includes(blankType);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to unblank card',
            cardCondition: card => card.location === 'play area' && 
                (!blankBonuses || card.getType() === 'goods'),
            onSelect: (p, card) => {
                this.handleAction(p, card, 'unblank', () => {
                    card.clearBlank(blankType);
                    this.game.addAlert('danger', '{0} uses the /unblank command to remove the blank condition from {1} (type "{2}")', p, card, blankType);
                }); 
                return true;
            }
        });
    }

    addKeyword(player, args) {
        var keyword = args[1];
        if(!keyword) {
            return false;
        }

        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to add keyword to card',
            cardCondition: card => card.location === 'play area',
            onSelect: (p, card) => {
                this.handleAction(p, card, 'add keyword to', () => {
                    card.addKeyword(keyword);
                    this.game.addAlert('danger', '{0} uses the /add-keyword command to add the {1} keyword to {2}', p, keyword, card);
                }); 
                return true;
            }
        });
    }

    removeKeyword(player, args) {
        var keyword = args[1];
        if(!keyword) {
            return false;
        }

        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to add keyword to card',
            cardCondition: card => card.location === 'play area',
            onSelect: (p, card) => {
                this.handleAction(p, card, 'remove keyword from', () => {
                    card.removeKeyword(keyword);
                    this.game.addAlert('danger', '{0} uses the /remove-keyword command to remove the {1} keyword from {2}', p, keyword, card);
                }); 
                return true;
            }
        });
    }

    discardFromDeck(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);

        this.game.addAlert('danger', '{0} uses the /discard-deck command to discard {1} from deck', player, TextHelper.count(num, 'card'));
        
        player.discardFromDrawDeck(num);
    }

    discardRandom(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);

        this.game.addAlert('danger', '{0} uses the /discard-random command to discard {1} at random', player, TextHelper.count(num, 'card'));

        player.discardAtRandom(num);
    }

    giveControl(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude',
            waitingPromptTitle: 'Waiting for opponent to give control',
            cardCondition: card => ['play area', 'discard pile', 'dead pile'].includes(card.location) && card.controller === player,
            onSelect: (p, card) => {
                this.game.promptForOpponentChoice(player, {
                    onSelect: otherPlayer => {
                        this.game.takeControl(otherPlayer, card);
                        this.game.addAlert('danger', '{0} uses the /give-control command to pass control of {1} to {2}', p, card, otherPlayer);
                    }
                });

                return true;
            }
        });
    }

    cancelPrompt(player) {
        this.game.addAlert('danger', '{0} uses the /cancel-prompt to skip the current step.', player);
        this.game.pipeline.cancelStep();
        this.game.cancelPromptUsed = true;
    }

    cancelShootout(player) {
        if(!this.game.shootout) {
            return;
        }
        this.game.addAlert('danger', '{0} uses the /cancel-shootout to end the shootout.', player);
        if(this.game.shootout.leaderPosse) {
            this.game.shootout.actOnLeaderPosse(dude => this.game.shootout.removeFromPosse(dude));
        }
    }

    setToken(player, args) {
        let token = args[1];
        let num = this.getNumberOrDefault(args[2], 1);

        if(!this.isValidToken(token)) {
            return false;
        }

        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to set token',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude', 'deed', 'goods', 'spell', 'outfit'],
            onSelect: (p, card) => {
                this.handleAction(p, card, `set token ${token} (${num})`, () => {
                    let numTokens = card.tokens[token] || 0;
                    card.modifyToken(token, num - numTokens);
                    this.game.addAlert('danger', '{0} uses the /token command to set the {1} token count of {2} to {3}', p, token, card, num);
                }); 
                return true;
            }
        });
    }

    disconnectMe(player) {
        player.socket.disconnect();
    }

    revealHand(player) {
        this.game.addAlert('danger',
            '{0} uses the /reveal-hand command to reveal their hand as: {1}', player, player.hand);
    }

    revealDeck(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        const topCards = player.drawDeck.slice(0, num);
        this.game.addAlert('danger',
            '{0} uses the /reveal-deck command to reveal {1} cards from deck: {2}', player, num, topCards);
    }

    lookAtDeck(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        const actualAmount = Math.min(num, player.drawDeck.length);
        const topCards = player.drawDeck.slice(0, actualAmount);
        this.game.promptForSelect(player, {
            activePromptTitle: `Look at ${player.name}'s deck`,
            revealTargets: true,
            cardCondition: card => card.location === 'draw deck' && 
                card.controller === player && 
                topCards.includes(card),
            onSelect: () => true
        });
        this.game.addAlert('danger',
            '{0} uses the /look-deck command to look at {1} cards from top of their deck', player, num);
    }

    removeFromGame(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to remove a card from the game',
            cardCondition: card => card.controller === player && card.owner === player && !['out of game'].includes(card.location),
            cardType: ['dude', 'deed', 'goods', 'spell', 'action', 'joker'],
            onSelect: (p, card) => {
                player.removeCardFromGame(card);
                this.game.addAlert('danger', '{0} uses the /remove-from-game command to remove {1} from the game', player, card);
                return true;
            }
        });
    }

    value(player, args) {
        var modifier = this.determineModifier(args[1]);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set value for',
            waitingPromptTitle: 'Waiting for opponent to set value',
            cardCondition: card => card.location === 'play area',
            cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
            onSelect: (p, card) => {
                this.handleAction(p, card, 'modify value (' + modifier.text + ')', () => {
                    let value = modifier.mod;
                    if(modifier.set !== undefined && modifier.set !== null) {
                        value = modifier.set - card.value;
                    }
                    card.value += value;
                    this.game.addAlert('danger', '{0} uses the /value command to set the value of {1} to {2}', p, card, card.value);
                }); 
                return true;
            }
        });
    }

    clearEffects(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to select a card',
            cardCondition: card => card.location === 'play area' && card.controller === player && card.owner === player,
            cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
            onSelect: (p, card) => {
                this.game.effectEngine.effects.forEach(effect => {
                    if(effect.source !== card) {
                        effect.removeTarget(card);
                    }
                });
                this.game.addAlert('danger', '{0} uses the /clear-effects command to remove effects from {1}', player, card);
                return true;
            }
        });
    }

    addCard(player, args) {
        let cardInfo = args.slice(1).join(' ');
        let card = Object.values(this.game.cardData).find(c => {
            return c.title.toLowerCase() === cardInfo.toLowerCase() || c.code === cardInfo;
        });

        if(!card) {
            return false;
        }
        if(this.game.restrictedList.isPt && !player.user.permissions.isContributor) {
            return false;
        }

        let deck = new Deck();
        let preparedCard = deck.createCard(player, card);

        if(!preparedCard) {
            return true;
        }

        preparedCard.applyAnyLocationPersistentEffects();

        if(preparedCard.isToken()) {
            player.putIntoPlay(preparedCard, player.outfit.uuid);
        } else {
            if(deck.isDrawCard(card)) {
                player.moveCard(preparedCard, 'draw deck');
            }
        }

        this.game.allCards.push(preparedCard);
        player.allCards.push(preparedCard);

        if(preparedCard.isToken()) {
            this.game.addAlert('danger', '{0} uses the /add-card command to put Token {1} into their outfit', player, preparedCard);
        } else {
            this.game.addAlert('danger', '{0} uses the /add-card command to add {1} to their deck', player, preparedCard);
        }

        return true;
    }

    attach(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to attach/reattach',
            waitingPromptTitle: 'Waiting for opponent to select card to attach/reattach',
            cardCondition: card => ['play area', 'hand', 'discard pile', 'being played'].includes(card.location) && card.controller === player,
            cardType: ['goods', 'spell', 'action', 'dude'],
            onSelect: (p, cardToAttach) => {
                const title = (cardToAttach.parent ? 'reattach ' : 'attach ') + cardToAttach.title;
                this.game.promptForSelect(p, {
                    activePromptTitle: 'Select where to ' + title,
                    waitingPromptTitle: 'Waiting for opponent to select parent for attachment',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller.canAttach(cardToAttach, card, 'chatcommand') &&
                        (card.controller === player || cardToAttach.hasKeyword('condition') || cardToAttach.hasKeyword('totem')),
                    cardType: ['deed', 'dude', 'outfit'],
                    onSelect: (player, target) => {
                        player.performAttach(cardToAttach, target, 'chatcommand');    
                        this.game.addAlert('danger', '{0} uses the /attach command to attach {1} to {2}', player, cardToAttach, target);         
                        this.game.attachmentValidityCheck.enforceValidity();                   
                        return true;
                    }
                });
                return true;
            }
        });
    }

    useAbility(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to use',
            waitingPromptTitle: 'Waiting for opponent to select card to use',
            cardCondition: card => ['play area', 'hand'].includes(card.location) && card.controller === player,
            cardType: ['goods', 'spell', 'action', 'dude', 'deed', 'outfit', 'legend'],
            onSelect: (p, card) => {
                const unscriptedText = card.isScripted() ? '' : ' unscripted';
                if(card.getType() === 'action' && card.location === 'hand') {
                    this.game.addAlert('warning', '{0} is playing{1} {2}', p, unscriptedText, card);
                    p.moveCard(card, 'being played');
                } else {
                    this.game.addAlert('warning', '{0} uses{1} card {2}', p, unscriptedText, card);
                }
                if(this.game.currentPlayWindow) {
                    player.unscriptedCardPlayed = card;
                }
                return true;
            }
        });        
    }

    resetStats(player, args) {
        var stat = args[1];
        var statsToReset = ['suit', 'value', 'bullets', 'influence', 'control', 'upkeep', 'production'];
        if(stat && !statsToReset.includes(stat)) {
            this.game.addAlert('danger', '{0} uses the /reset-stats command with incorrect stat "{1}"', 
                player, stat);
            return;        
        }
        var textStat = 'stats';
        if(stat) {
            textStat = stat;
            statsToReset = [stat];
        }
        this.game.promptForSelect(player, {
            activePromptTitle: `Select a card to reset stat${textStat}`,
            waitingPromptTitle: 'Waiting for opponent to reset stats',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['goods', 'spell', 'action', 'dude', 'deed'],
            onSelect: (p, card) => {
                statsToReset.forEach(stat => {
                    if(stat === 'suit') {
                        card.addSuitEffect('chatcommand', card.getPrintedStat(stat));
                    } else {
                        if(stat) {
                            card[stat] = card.getPrintedStat(stat);
                        }
                    }
                });
                this.game.addAlert('danger', '{0} uses the /reset-stats command to set{1} of {2} to printed', 
                    p, textStat, card);
                return true;
            }
        });
    }

    shuffleDiscard(player) {
        player.shuffleDiscardToDrawDeck();
    }

    getNumberOrDefault(string, defaultNumber, allowNeg = false) {
        var num = parseInt(string);

        if(isNaN(num)) {
            num = defaultNumber;
        }

        if(num < 0 && !allowNeg) {
            num = defaultNumber;
        }

        return num;
    }

    isValidToken(token) {
        if(!token) {
            return false;
        }

        return Tokens.includes(token);
    }

    rematch(player) {
        if(this.game.finishedAt) {
            this.game.addAlert('info', '{0} is requesting a rematch', player);
        } else {
            this.game.addAlert('danger', '{0} is requesting a rematch.  The current game is not finished', player);
        }

        this.game.queueStep(new RematchPrompt(this.game, player));
    }

    handleAction(player, card, action, handler) {
        if(card.controller === player) {
            handler();
        } else {
            this.game.promptForYesNo(card.controller, {
                promptTitle: 'Chat Command',
                title: `${player.name} wants to ${action} for ${card.title}, do you allow them to continue?`,
                onYes: () => {
                    handler();
                },
                onNo: () => {
                    this.game.addAlert('danger', '{0} does not allow chatcommand action "{1}" run by {2}', 
                        card.controller, action, player);
                }
            });
        }
    }

    selectSkillOrFu(player, skillOrFu) {
        let pullBonus = this.pullingDude.getSkillRating(skillOrFu);
        this.game.addAlert('warning', '{0} uses the /pull command to perform "{1}" pull with {2}', 
            player, skillOrFu, this.pullingDude);
        player.handlePull({
            successCondition: pulledValue => {
                if(skillOrFu === 'kung fu') {
                    return pulledValue < this.pullingDude.value;
                }
                return pulledValue >= this.pullDifficulty;
            }, 
            successHandler: () => {
                if(player.unscriptedPull) {
                    player.unscriptedPull.isSuccessful = true;
                }
            },
            failHandler: () => {
                if(player.unscriptedPull) {
                    player.unscriptedPull.isSuccessful = false;
                }
            },
            pullingDude: this.pullingDude,
            pullBonus: skillOrFu !== 'kung fu' ? pullBonus : 0,
            chatCommandDiff: skillOrFu !== 'kung fu' ? `chatcommands with difficulty ${this.pullDifficulty}` :
                `chatcommands with difficulty ${this.pullingDude.value}`,
            player: player
        });
        return true;
    }

    determineModifier(arg) {
        if(typeof(arg) === 'string') {
            if(arg === '+') {
                return { mod: 1, text: '+1' };
            }
            if(arg === '-') {
                return { mod: -1, text: '-1' };
            }
            if(arg.startsWith('+')) {
                return { mod: this.getNumberOrDefault(arg, 1), text: arg };
            }
            if(arg.startsWith('-')) {
                return { mod: this.getNumberOrDefault(arg, -1, true), text: arg };
            }            
        }
        return { set: this.getNumberOrDefault(arg, 1, true), text: arg };
    }
}

module.exports = ChatCommands;
