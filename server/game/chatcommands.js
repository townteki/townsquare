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
            '/add-card': this.addCard,
            '/bullets': this.bullets,
            '/blank': this.blank,
            '/bounty': this.bounty,
            '/cancel-prompt': this.cancelPrompt,
            '/cancel-shootout': this.cancelShootout,
            '/clear-shooter': this.clearShooter,
            '/control': this.control,
            '/discard': this.discard,
            '/disconnectme': this.disconnectMe,
            '/draw': this.draw,
            '/give-control': this.giveControl,
            '/inf': this.influence,
            '/join-posse': this.joinPosse,
            '/move-bottom': this.moveBottom,
            '/rematch': this.rematch,
            '/remove-from-game': this.removeFromGame,
            '/remove-from-posse': this.removeFromPosse,
            '/remove-keyword': this.removeKeyword,
            '/reset-abilities': this.resetAbilities,
            '/reveal-hand': this.revealHand,
            '/shooter': this.shooter,
            '/token': this.setToken,
            '/unblank': this.unblank
        };
    }

    executeCommand(player, command, args) {
        if(!player || !this.commands[command]) {
            return false;
        }

        return this.commands[command].call(this, player, args) !== false;
    }

    draw(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);

        this.game.addAlert('danger', '{0} uses the /draw command to draw {1} cards to their hand', player, num);

        player.drawCardsToHand(num);
    }

    bullets(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set bullets for',
            waitingPromptTitle: 'Waiting for opponent to set bullets',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude'],
            onSelect: (p, card) => {
                let bullets = num - card.bullets;
                card.bullets += bullets;

                if(card.bullets < 0) {
                    card.bullets = 0;
                }
                this.game.addAlert('danger', '{0} uses the /bullets command to set the bullets of {1} to {2}', p, card, num);
                return true;
            }
        });
    }

    bounty(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set bounty for',
            waitingPromptTitle: 'Waiting for opponent to set bounty',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude'],
            onSelect: (p, card) => {
                let change = card.bounty - num;
                if(num > 0) {
                    card.decreaseBounty(change);
                } else {
                    card.increaseBounty(change * -1);
                }

                this.game.addAlert('danger', '{0} uses the /bounty command to set the bounty of {1} to {2}', p, card, num);
                return true;
            }
        });
    }

    influence(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        var type = this.getNumberOrDefault(args[2], 'influence');
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set ' + type + ' for',
            waitingPromptTitle: 'Waiting for opponent to set ' + type,
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude'],
            onSelect: (p, card) => {
                // TODO M2 so far we only use standard influence, no influence:deed
                let influence = num - card.influence;
                card.influence += influence;

                if(card.influence < 0) {
                    card.influence = 0;
                }
                this.game.addAlert('danger', '{0} uses the /influence command to set the influence of {1} to {2}', p, card, num);
                return true;
            }
        });
    }

    control(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to set control for',
            waitingPromptTitle: 'Waiting for opponent to set control',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude', 'deed', 'goods', 'spell'],
            onSelect: (p, card) => {
                let control = num - card.control;
                card.control += control;

                if(card.control < 0) {
                    card.control = 0;
                }
                this.game.addAlert('danger', '{0} uses the /control command to set the control of {1} to {2}', p, card, num);
                return true;
            }
        });
    }

    resetAbilities(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to reset ability for',
            waitingPromptTitle: 'Waiting for opponent to reset ability',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude', 'deed', 'goods', 'spell', 'action', 'outfit'],
            onSelect: (p, card) => {
                card.resetAbilities();
                this.game.addAlert('danger', '{0} uses the /reset-ability command to reset abilities for card {1}', p, card);
                return true;
            }
        });        
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
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude'],
            onSelect: (p, card) => {
                card.addStudEffect('chatcommand', type);
                this.game.addAlert('danger', '{0} uses the /shooter command to set the {1} to {2}', p, card, type);
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

    ace(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to ace card',
            cardCondition: card => ['hand', 'draw hand', 'discard pile', 'play area'].includes(card.location) && card.controller === player,
            cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
            onSelect: (p, card) => {
                card.controller.aceCard(card);

                this.game.addAlert('danger', '{0} uses the /ace command to ace {1}', p, card);
                return true;
            }
        });
    }

    joinPosse(player) {
        if(!this.game.shootout) {
            return;
        }
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a dude to join posse',
            waitingPromptTitle: 'Waiting for opponent to select dude to join posse',
            cardCondition: card => card.location === 'play area' && card.controller === player && !card.isParticipating(),
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.game.shootout.addToPosse(card);
                this.game.addAlert('danger', '{0} uses the /join-posse command to add {1} to posse', p, card);
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
            cardCondition: card => card.location === 'play area' && card.controller === player && card.isParticipating(),
            cardType: ['dude'],
            onSelect: (p, card) => {
                this.game.shootout.removeFromPosse(card);
                this.game.addAlert('danger', '{0} uses the /remove-from-posse command to remove {1} from posse', p, card);
                return true;
            }
        });
    }

    blank(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to blank card',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            onSelect: (p, card) => {
                card.setBlank('full');

                this.game.addAlert('danger', '{0} uses the /blank command to blank {1}', p, card);
                return true;
            }
        });
    }

    unblank(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to unblank card',
            cardCondition: card => card.location === 'play area' && card.controller === player,
            onSelect: (p, card) => {
                card.clearBlank('full');

                this.game.addAlert('danger', '{0} uses the /unblank command to remove the blank condition from {1}', p, card);
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
            cardCondition: card => card.location === 'play area' && card.controller === player,
            onSelect: (p, card) => {
                card.addKeyword(keyword);

                this.game.addAlert('danger', '{0} uses the /add-keyword command to add the {1} keyword to {2}', p, keyword, card);
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
            cardCondition: card => card.location === 'play area' && card.controller === player,
            onSelect: (p, card) => {
                card.removeKeyword(keyword);

                this.game.addAlert('danger', '{0} uses the /remove-keyword command to remove the {1} keyword from {2}', p, keyword, card);
                return true;
            }
        });
    }

    discard(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);

        this.game.addAlert('danger', '{0} uses the /discard command to discard {1} at random', player, TextHelper.count(num, 'card'));

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

    // TODO M2 not really working, should be updated
    cancelShootout(player) {
        if(!this.game.shootout) {
            return;
        }
        this.game.addAlert('danger', '{0} uses the /cancel-shootout to end the shootout.', player);
        this.game.shootout.endPhase(); 
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
            cardCondition: card => card.location === 'play area' && card.controller === player,
            cardType: ['dude', 'deed', 'goods', 'spell', 'outfit'],
            onSelect: (p, card) => {
                let numTokens = card.tokens[token] || 0;

                card.modifyToken(token, num - numTokens);
                this.game.addAlert('danger', '{0} uses the /token command to set the {1} token count of {2} to {3}', p, token, card, num);

                return true;
            }
        });
    }

    disconnectMe(player) {
        player.socket.disconnect();
    }

    moveBottom(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to move a card to the bottom of his deck',
            cardCondition: card => card.controller === player && card.owner === player,
            onSelect: (p, card) => {
                player.moveCard(card, 'draw deck', { bottom: true });
                this.game.addAlert('danger', '{0} uses the /move-bottom command to move {1} to the bottom of their deck', p, card);
                return true;
            }
        });
    }

    revealHand(player) {
        this.game.addAlert('danger',
            '{0} uses the /reveal-hand command to reveal their hand as: {1}', player, player.hand);
    }

    removeFromGame(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card',
            waitingPromptTitle: 'Waiting for opponent to remove a card from the game',
            cardCondition: card => card.controller === player && card.owner === player && !['out of game'].includes(card.location),
            cardType: ['dude', 'deed', 'goods', 'spell', 'action'],
            onSelect: (p, card) => {
                player.removeCardFromGame(card);
                this.game.addAlert('danger', '{0} uses the /remove-from-game command to remove {1} from the game', player, card);
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

        let deck = new Deck();
        let preparedCard = deck.createCard(player, card);

        preparedCard.applyAnyLocationPersistentEffects();

        if(deck.isDrawCard(card)) {
            player.moveCard(preparedCard, 'draw deck');
        }

        this.game.allCards.push(preparedCard);

        this.game.addAlert('danger', '{0} uses the /add-card command to add {1} to their deck', player, preparedCard);

        return true;
    }

    getNumberOrDefault(string, defaultNumber) {
        var num = parseInt(string);

        if(isNaN(num)) {
            num = defaultNumber;
        }

        if(num < 0) {
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
}

module.exports = ChatCommands;
