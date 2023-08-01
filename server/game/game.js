const EventEmitter = require('events');
const moment = require('moment');
const _ = require('lodash');

const AttachmentValidityCheck = require('./AttachmentValidityCheck.js');
const ChatCommands = require('./chatcommands.js');
const GameChat = require('./gamechat.js');
const EffectEngine = require('./effectengine.js');
const Effect = require('./effect.js');
const Player = require('./player.js');
const Spectator = require('./spectator.js');
const AnonymousSpectator = require('./anonymousspectator.js');
const GamePipeline = require('./gamepipeline.js');
const Phases = require('./gamesteps/Phases');
const SimpleStep = require('./gamesteps/simplestep.js');
const ChoosePlayerPrompt = require('./gamesteps/ChoosePlayerPrompt');
const CardNamePrompt = require('./gamesteps/CardNamePrompt');
const DeckSearchPrompt = require('./gamesteps/DeckSearchPrompt');
const MenuPrompt = require('./gamesteps/menuprompt.js');
const SelectCardPrompt = require('./gamesteps/selectcardprompt.js');
const EventWindow = require('./gamesteps/eventwindow.js');
const AbilityResolver = require('./gamesteps/abilityresolver.js');
const TraitTriggeredAbilityWindow = require('./gamesteps/TraitTriggeredAbilityWindow.js');
const TriggeredAbilityWindow = require('./gamesteps/TriggeredAbilityWindow.js');
const ReactionBeforeWindow = require('./gamesteps/ReactionBeforeWindow');
const Event = require('./event.js');
const NullEvent = require('./NullEvent');
const AtomicEvent = require('./AtomicEvent.js');
const GroupedCardEvent = require('./GroupedCardEvent.js');
const SimultaneousEvents = require('./SimultaneousEvents');
const ChooseGRSourceAmounts = require('./gamesteps/ChooseGRSourceAmounts.js');
const DropCommand = require('./ServerCommands/DropCommand');
const CardVisibility = require('./CardVisibility');
const PlainTextGameChatFormatter = require('./PlainTextGameChatFormatter');
const TimeLimit = require('./timeLimit.js');
const Location = require('./gamelocation.js');
const Shootout = require('./gamesteps/shootout.js');
const ChooseYesNoPrompt = require('./gamesteps/ChooseYesNoPrompt.js');
const SelectLocationPrompt = require('./gamesteps/selectlocationprompt.js');
const AbilityContext = require('./AbilityContext.js');
const ValuePrompt = require('./gamesteps/valueprompt.js');
const PhaseNames = require('./Constants/PhaseNames.js');
const { TownSquareUUID } = require('./Constants/index.js');
const Automaton = require('./Solo/automaton.js');
const PlayWindow = require('./gamesteps/playwindow.js');
const MathHelper = require('./MathHelper.js');
const NullCard = require('./nullcard.js');
const NullLocation = require('./nulllocation.js');

/** @typedef {import('./gamesteps/shootout')} Shootout */
class Game extends EventEmitter {
    constructor(details, options = {}) {
        super();

        this.event = details.event;
        this.eventName = details.event && details.event.name;
        // restrictedList.cardSet = [ 'new | 'original' ]
        this.restrictedList = details.restrictedList;
        this.allCards = [];
        this.attachmentValidityCheck = new AttachmentValidityCheck(this);
        this.effectEngine = new EffectEngine(this);
        this.playersAndSpectators = {};
        this.playerCards = {};
        this.gameChat = new GameChat();
        this.chatCommands = new ChatCommands(this);
        this.pipeline = new GamePipeline();
        this.id = details.id;
        this.name = details.name;
        this.allowSpectators = details.allowSpectators;
        this.showHand = details.showHand;
        this.owner = details.owner.username;
        this.started = false;
        this.playStarted = false;
        this.createdAt = new Date();
        this.useGameTimeLimit = details.useGameTimeLimit;
        this.gameTimeLimit = details.gameTimeLimit;
        this.timeLimit = new TimeLimit(this);
        this.savedGameId = details.savedGameId;
        this.gameType = details.gameType;
        this.abilityContextStack = [];
        this.abilityWindowStack = [];
        this.beforeEventHandlers = {};
        this.password = details.password;
        this.cancelPromptUsed = false;
        /** @type {Shootout} */
        this.shootout = null;

        this.cardData = options.cardData || [];
        this.packData = options.packData || [];
        this.restrictedListData = this.restrictedList ? [this.restrictedList] : (options.restrictedListData || []);
        this.remainingPhases = [];
        this.skipPhase = {};
        this.cardVisibility = new CardVisibility(this);

        this.townsquare = new Location.TownSquare(this);

        for(let player of Object.values(details.players || {})) {
            this.playersAndSpectators[player.user.username] = new Player(player.id, player.user, this.owner === player.user.username, this);
        }

        if(this.isSolo()) {
            this.automaton = new Automaton(this, details.soloPlayer.user);
        }

        for(let spectator of Object.values(details.spectators || {})) {
            this.playersAndSpectators[spectator.user.username] = new Spectator(spectator.id, spectator.user);
        }

        this.setMaxListeners(0);

        this.router = options.router;

        this.pushAbilityContext({ resolutionStage: 'framework' });
        this.on('onCardLeftPlay', event => {
            if(event.card.control || event.card.influence) {
                this.checkWinCondition();
            }
        });
    }

    isLegacy() {
        return this.restrictedList.cardSet === 'original';
    }

    isSolo() {
        return this.gameType === 'solo';
    }

    reportError(e) {
        this.router.handleError(this, e);
    }

    addMessage() {
        this.gameChat.addMessage(...arguments);
    }

    addAlert() {
        this.gameChat.addAlert(...arguments);
    }

    get messages() {
        return this.gameChat.messages;
    }

    getArrayAsText(array, key) {
        if(array.length === 1) {
            if(key) {
                return array[0][key];
            }
            return array[0];      
        }
        let arrayText = '';
        for(let i = 0; i < array.length; i++) {
            let itemText = '';
            if(key) {
                itemText = array[i][key];
            } else {
                itemText = array[i];
            }
            if(i === array.length - 1) {
                arrayText += ' and ' + itemText;
            } else if(i === 0) {
                arrayText += itemText;
            } else {
                arrayText += ' ,' + itemText;
            }
        }
        return arrayText;
    }

    getPlainTextLog() {
        let formatter = new PlainTextGameChatFormatter(this.gameChat);
        return formatter.format();
    }

    hasActivePlayer(playerName) {
        return this.playersAndSpectators[playerName] && !this.playersAndSpectators[playerName].left;
    }

    /**
     * Returns all players in the game (not Spectators).
     *
     * @param {boolean} includeSoloPlayer - including Automaton for Solo games
     * @returns {Array.<Player>} - array of Players.
     */    
    getPlayers(includeSoloPlayer = true) {
        const humanPlayers = Object.values(this.playersAndSpectators).filter(player => !player.isSpectator());
        if(this.automaton && includeSoloPlayer) {
            return humanPlayers.concat([this.automaton]);
        }
        return humanPlayers;
    }

    getNumberOfPlayers() {
        return this.getPlayers().length;
    }

    getPlayerByName(playerName) {
        if(this.automaton && this.automaton.name === playerName) {
            return this.automaton;
        }
        let player = this.playersAndSpectators[playerName];

        if(!player || player.isSpectator()) {
            return;
        }

        return player;
    }

    getPlayersInFirstPlayerOrder() {
        if(!this.getFirstPlayer() && this.currentPhase === 'setup') {
            let players = this.getPlayers();
            let firstPlayer = players[MathHelper.randomInt(players.length)];
            return this.getPlayersInBoardOrder(player => player === firstPlayer);
        }
        return this.getPlayersInBoardOrder(player => player.firstPlayer);
    }

    getPlayersInBoardOrder(predicate) {
        let players = this.getPlayers();
        let index = players.findIndex(predicate);
        if(index === -1) {
            // TODO M2 instead of returning all players, we should pull for low value to determine first player
            return players;
        }

        let beforeMatch = players.slice(0, index);
        let matchAndAfter = players.slice(index);

        return matchAndAfter.concat(beforeMatch);
    }

    getPlayersAndSpectators() {
        return this.playersAndSpectators;
    }

    getSpectators() {
        return Object.values(this.playersAndSpectators).filter(player => player.isSpectator());
    }

    getFirstPlayer() {
        return this.getPlayers().find(p => {
            return p.firstPlayer;
        });
    }

    setFirstPlayer(firstPlayer) {
        for(let player of this.getPlayers()) {
            player.firstPlayer = player.equals(firstPlayer);
        }
        this.raiseEvent('onFirstPlayerDetermined', { player: firstPlayer });
    }

    getOpponents(player) {
        return this.getPlayers().filter(p => !p.equals(player));
    }

    getOpponentsInFirstPlayerOrder(player) {
        return this.getPlayersInFirstPlayerOrder().filter(p => !p.equals(player));
    }

    isCardVisible(card, player) {
        return this.cardVisibility.isVisible(card, player);
    }

    anyCardsInPlay(predicate) {
        return this.allCards.some(card => card.location === 'play area' && predicate(card));
    }

    filterCardsInPlay(predicate) {
        return this.allCards.filter(card => card.location === 'play area' && predicate(card));
    }

    getNumberOfCardsInPlay(predicate) {
        return this.allCards.reduce((num, card) => {
            if(card.location === 'play area' && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    findCardInPlayByUuid(uuid) {
        if(!uuid) {
            return;
        }
        for(let player of this.getPlayers()) {
            let foundCard = player.findCardInPlayByUuid(uuid); 
            if(foundCard) {
                return foundCard;
            }            
        }
    }   
    
    findCardsInPlay(predicate) {
        let foundCards = [];
        for(let player of this.getPlayers()) {
            var playerCards = player.findCards(player.cardsInPlay, predicate);
            // need to filter out duplicates - can happen if attachment controlled by one player is attached to 
            // a card owned by the other player
            foundCards = foundCards.concat(playerCards.filter(pCard => !foundCards.includes(pCard)));
        }
        return foundCards;
    }
    
    findLocation(uuid) {
        if(!uuid) {
            return;
        }
        if(uuid === TownSquareUUID) {
            return this.townsquare;
        }        
        for(let player of this.getPlayers()) {
            let foundLocation = player.findLocation(uuid); 
            if(foundLocation) {
                return foundLocation;
            }
        }
    }

    // use card in condition
    findLocations(condition) {
        let foundLocations = this.filterCardsInPlay(card => condition(card));
        if(condition(this.townsquare.locationCard)) {
            foundLocations.concat(this.townsquare);
        }
        return foundLocations.map(locationCard => locationCard.getGameLocation());
    }

    isTownSquare(locationUuid) {
        const gameLocation = this.findLocation(locationUuid);
        return gameLocation ? gameLocation.isTownSquare() : false;
    }

    isOutfit(locationUuid) {
        const gameLocation = this.findLocation(locationUuid);
        return gameLocation ? gameLocation.isOutfit() : false;
    }

    isHome(locationUuid, player) {
        const gameLocation = this.findLocation(locationUuid);
        return gameLocation ? gameLocation.isHome(player) : false;
    }

    isOpponentsHome(locationUuid, player) {
        const gameLocation = this.findLocation(locationUuid);
        return gameLocation ? gameLocation.isOpponentsHome(player) : false;
    }

    getDudesAtLocation(locationUuid, condition) {
        let gameLocation = this.findLocation(locationUuid);
        if(!gameLocation) {
            return [];
        }
        return gameLocation.getDudes(condition);
    }

    getDudesInPlay(player, condition = () => true) {
        return this.filterCardsInPlay(card => 
            card.getType() === 'dude' &&
            (!player || player.equals(card.controller)) &&
            condition(card)
        );
    }

    addEffect(source, properties) {
        this.addSimultaneousEffects([{ source: source, properties: properties }]);
    }

    addSimultaneousEffects(effectProperties) {
        let effects = effectProperties.reduce((array, effect) => {
            let flattenedProperties = Effect.flattenProperties(effect.properties);
            let effects = flattenedProperties.map(props => new Effect(this, effect.source, props));
            return array.concat(effects);
        }, []);
        this.effectEngine.addSimultaneous(effects);
    }

    cardClicked(sourcePlayer, cardId) {
        let player = this.getPlayerByName(sourcePlayer);
        let card = this.allCards.find(card => card.uuid === cardId);

        if(!player || !card) {
            return;
        }

        if(this.pipeline.handleCardClicked(player, card)) {
            return;
        }

        card.onClick(player);
    }

    cardHasMenuItem(card, player, menuItem) {
        let menu = card.getMenu(player) || [];
        return menu.some(m => {
            return m.method === menuItem.method;
        });
    }

    callCardMenuCommand(card, player, menuItem) {
        if(!card || !card[menuItem.method] || !this.cardHasMenuItem(card, player, menuItem)) {
            return;
        }

        card[menuItem.method](player, menuItem.arg);
    }

    menuItemClick(sourcePlayer, cardId, menuItem) {
        var player = this.getPlayerByName(sourcePlayer);

        if(!player) {
            return;
        }

        if(menuItem.command === 'click') {
            this.cardClicked(sourcePlayer, cardId);
            return;
        }

        let card = this.allCards.find(card => card.uuid === cardId);

        if(!card) {
            return;
        }

        switch(card.location) {
            case 'legend':
                this.callCardMenuCommand(player.legend, player, menuItem);
                break;
            case 'hand':
            case 'draw hand':
            case 'play area':
                if(!player.isAllowed(card, menuItem.triggeringPlayer)) {
                    return;
                }

                this.callCardMenuCommand(card, player, menuItem);
                break;
        }
    }

    showDrawDeck(playerName, newValue) {
        let player = this.getPlayerByName(playerName);

        if(!player) {
            return;
        }

        if(newValue === null || newValue === undefined) {
            newValue = !player.showDeck;
        }

        if(player.showDeck ^ newValue) {
            player.setDrawDeckVisibility(newValue);

            if(newValue) {
                this.addAlert('danger', '{0} is looking at their deck', player);
            } else {
                this.addAlert('info', '{0} stops looking at their deck', player);
            }
        }
    }

    drop(playerName, cardId, target, gameLocation, targetPlayerName) {
        let player = this.getPlayerByName(playerName);
        let targetPlayer = this.getPlayerByName(targetPlayerName);
        let card = this.allCards.find(card => card.uuid === cardId);

        if(!player || !card) {
            return;
        }

        let command = new DropCommand(this, player, card, target, gameLocation, targetPlayer);
        command.execute();
    }

    /**
     * Spends a specified amount of ghostrock for a player. "Spend" refers to any
     * usage of ghostrock that returns ghostrock to the bank as part of Shoppin', 
     * an ability cost, or ghostrock that has been moved from a player's stash to a card.
     *
     * @param {Object} spendParams
     * @param {number} spendParams.amount
     * The amount of ghostrock being spent
     * @param {Player} spendParams.player
     * The player whose ghostrock is being spent
     * @param {string} spendParams.playingType
     * The type of usage for the ghostrock (e.g. 'shoppin', 'ability', etc)
     * @param {Function} callback
     * Optional callback that will be called after the ghostrock has been spent
     */
    spendGhostRock(spendParams, callback = () => true) {
        let activePlayer = spendParams.activePlayer || this.currentAbilityContext && this.currentAbilityContext.player;
        spendParams = Object.assign({ playingType: 'ability', activePlayer: activePlayer }, spendParams);

        this.queueStep(new ChooseGRSourceAmounts(this, spendParams, callback));
    }

    /**
     * Transfers ghostrock from one ghostrock source to another. Both the source and the
     * target for the transfer can be either a card or a player.
     *
     * @param {Object} transferParams
     * @param {number} transferParams.amount
     * The amount of ghostrock being moved
     * @param {(BaseCard|Player)} transferParams.from
     * The source object from which ghostrock is being moved
     * @param {(BaseCard|Player)} transferParams.to
     * The target object to which ghostrock is being moved
     */
    transferGhostRock(transferParams) {
        let { from, to, amount } = transferParams;
        let appliedGR = Math.min(from.ghostrock, amount);

        if(from.getGameElementType() === 'player') {
            let activePlayer = transferParams.activePlayer || this.currentAbilityContext && this.currentAbilityContext.player;
            appliedGR = Math.min(from.getSpendableGhostRock({ player: from, activePlayer: activePlayer }), amount);
            this.spendGhostRock({ amount: appliedGR, player: from, activePlayer: activePlayer }, () => {
                to.modifyGhostRock(appliedGR);
                this.raiseEvent('onGhostRockTransferred', { source: from, target: to, amount: appliedGR });
            });
            return;
        }

        from.modifyGhostRock(-appliedGR);
        to.modifyGhostRock(appliedGR);

        this.raiseEvent('onGhostRockTransferred', { source: from, target: to, amount: appliedGR });
    }

    /**
     * Returns the specified amount of ghostrock from a player to the bank.
     *
     * @param {Object} params
     * @param {Player} params.player The player whose stash will be deducted
     * @param {number} params.amount The amount of ghostrock being returned
     */
    returnGhostRockToBank(params) {
        let { player, amount } = params;
        let appliedAmount = Math.min(player.ghostrock, amount);

        player.modifyGhostRock(-appliedAmount);
    }

    clone() {
        let clonedGame = _.cloneDeep(this);
        clonedGame.queueSimpleStep = (func => func());
        return clonedGame;
    }

    simulateSundown(parClonedGame) {
        if(this.currentPhase === PhaseNames.Sundown) {
            return this;
        }
        let clonedGame = this.simulateEndOfShootout(parClonedGame);
        this.allCards.forEach(card => card.game = clonedGame);
        if(clonedGame.currentPhase === PhaseNames.Gambling) {
            clonedGame.effectEngine.onPhaseEnded({ phase: PhaseNames.Gambling });
            clonedGame.currentPhase = PhaseNames.Upkeep;
            clonedGame.effectEngine.reapplyStateDependentEffects();
        }
        if(clonedGame.currentPhase === PhaseNames.Upkeep) {
            clonedGame.effectEngine.onPhaseEnded({ phase: PhaseNames.Upkeep });
            clonedGame.currentPhase = PhaseNames.HighNoon;
            clonedGame.effectEngine.reapplyStateDependentEffects();
        }
        clonedGame.effectEngine.onPhaseEnded({ phase: PhaseNames.HighNoon });
        clonedGame.currentPhase = '';
        clonedGame.effectEngine.reapplyStateDependentEffects();
        for(const player of clonedGame.getPlayers()) {
            player.phase = '';
        }

        clonedGame.effectEngine.onAtEndOfPhase({ phase: PhaseNames.HighNoon });
        clonedGame.currentPhase = PhaseNames.Sundown;
        for(const player of clonedGame.getPlayers()) {
            player.phase = PhaseNames.Sundown;
        }

        clonedGame.effectEngine.reapplyStateDependentEffects();
        this.allCards.forEach(card => card.game = this);
        return clonedGame;
    }

    simulateEndOfShootout(clonedGame) {
        if(!clonedGame) {
            clonedGame = this.clone();
        }
        if(!this.shootout) {
            return clonedGame;
        }
        this.allCards.forEach(card => card.game = clonedGame);
        clonedGame.effectEngine.onShootoutRoundFinished();
        clonedGame.effectEngine.onShootoutPhaseFinished();
        clonedGame.currentPhase = '';
        clonedGame.shootout = null;
        clonedGame.effectEngine.reapplyStateDependentEffects();
        for(const player of clonedGame.getPlayers()) {
            player.phase = '';
        }

        clonedGame.currentPhase = PhaseNames.HighNoon;
        for(const player of clonedGame.getPlayers()) {
            player.phase = PhaseNames.HighNoon;
        }

        clonedGame.effectEngine.reapplyStateDependentEffects();
        this.allCards.forEach(card => card.game = this);
        return clonedGame;
    }

    simulateShootout(playWindow = 'shootout plays', gamelocation) {
        if(this.currentPhase === PhaseNames.Shootout) {
            return this.clone();
        }
        if(this.currentPhase !== PhaseNames.HighNoon) {
            return;
        }
        let clonedGame = this.clone();
        this.allCards.forEach(card => card.game = clonedGame); 
        clonedGame.shootout = new Shootout(clonedGame, clonedGame.currentPhase, {}, { gamelocation: gamelocation }, { isSimulation: true });
        clonedGame.currentPhase = PhaseNames.Shootout;
        clonedGame.effectEngine.onShootoutPhaseStarted();
        clonedGame.effectEngine.onShootoutRoundStarted();
        for(const player of clonedGame.getPlayers()) {
            player.phase = PhaseNames.Shootout;
        }

        clonedGame.currentPlayWindow = new PlayWindow(clonedGame, playWindow);
        clonedGame.effectEngine.reapplyStateDependentEffects();
        this.allCards.forEach(card => card.game = this);
        return clonedGame;
    }

    checkWinCondition() {
        if([PhaseNames.HighNoon, PhaseNames.Sundown, PhaseNames.Shootout].includes(this.currentPhase)) {
            let gameToCheck = this.simulateSundown();
            gameToCheck.getPlayers().forEach(player => {
                const realPlayer = this.getPlayerByName(player.name);
                if(!realPlayer.currentCheck & player.isInCheck()) {
                    this.addAlert('warning', 'CHECK: {0} is in check', realPlayer);
                }
                realPlayer.currentCheck = player.currentCheck;
            });
        }
    }

    resolveTiebreaker(player1, player2, isForLowball = false) {
        if((player1.rankModifier < 0 && player2.rankModifier < 0) ||
            (player1.rankModifier > 0 && player2.rankModifier > 0)) {
            return { decision: 'exact tie' };
        }
        if(player1.rankModifier || player2.rankModifier) {
            let playerLowerMod = player1.rankModifier < player2.rankModifier ? player1 : player2;
            let playerHigherMod = player1.rankModifier < player2.rankModifier ? player2 : player1;
            return isForLowball ? { 
                winner: playerHigherMod, 
                loser: playerLowerMod, 
                decision: 'rank modifier' 
            } : { 
                winner: playerLowerMod, 
                loser: playerHigherMod, 
                decision: 'rank modifier' 
            };
        }
        if(!player1.getHandRank().tiebreaker || !player2.getHandRank().tiebreaker) {
            return { decision: 'exact tie' };
        }
        for(let i = 0; i < player1.getHandRank().tiebreaker.length; i++) {
            if(player1.getHandRank().tiebreaker[i] > player2.getHandRank().tiebreaker[i]) {
                return isForLowball ? { winner: player2, loser: player1, decision: 'tiebreaker' } : { winner: player1, loser: player2, decision: 'tiebreaker' };
            }
            if(player1.getHandRank().tiebreaker[i] < player2.getHandRank().tiebreaker[i]) {
                return isForLowball ? { winner: player1, loser: player2, decision: 'tiebreaker' } : { winner: player2, loser: player1, decision: 'tiebreaker' };
            }
        }
        for(let i = 0; i < player1.getHandRank().tiebreakerHighCards.length; i++) {
            if(player1.getHandRank().tiebreakerHighCards[i].value > player2.getHandRank().tiebreakerHighCards[i].value) {
                return isForLowball ? { winner: player2, loser: player1, decision: 'tiebreaker' } : { winner: player1, loser: player2, decision: 'tiebreaker' };
            }
            if(player1.getHandRank().tiebreakerHighCards[i].value < player2.getHandRank().tiebreakerHighCards[i].value) {
                return isForLowball ? { winner: player1, loser: player2, decision: 'tiebreaker' } : { winner: player2, loser: player1, decision: 'tiebreaker' };
            }
        }     
        return { decision: 'exact tie' };
    }

    recordDraw(lastPlayer) {
        if(this.winner) {
            return;
        }

        this.addAlert('info', 'The game ends in a draw because {0} cannot win the game', lastPlayer);
        this.winner = { name: 'DRAW' };
        this.finishedAt = new Date();
        this.winReason = 'draw';

        this.router.gameWon(this);
    }

    recordWinner(winner, reason) {
        if(this.winner) {
            return;
        }

        if(this.isSolo()) {
            const humanPlayer = this.getPlayers().find(player => player !== this.automaton);
            this.soloScore = humanPlayer.braggingRightsScore();
            this.addAlert('success', '{0} has won the game with final score: {1}', winner, this.soloScore.finalScore);
        } else {
            this.addAlert('success', '{0} has won the game', winner);
        }

        this.winner = winner;
        this.finishedAt = new Date();
        this.winReason = reason;

        this.router.gameWon(this);
    }

    changeStat(playerName, stat, value, forAutomaton) {
        let player = this.getPlayerByName(playerName);
        if(forAutomaton) {
            player = this.automaton;
        }
        if(!player) {
            return;
        }

        let target = player;

        target[stat] += value;

        if(target[stat] < 0) {
            target[stat] = 0;
        } else {
            this.addAlert('danger', '{0} sets {1} to {2} ({3})', player, stat, target[stat], (value > 0 ? '+' : '') + value);
        }
    }

    chat(playerName, message) {
        var player = this.playersAndSpectators[playerName];
        var args = message.split(' ');

        if(!player) {
            return;
        }

        if(!player.isSpectator()) {
            if(this.chatCommands.executeCommand(player, args[0], args)) {
                return;
            }

            let card = Object.values(this.cardData).find(c => {
                return c.title.toLowerCase() === message.toLowerCase();
            });

            if(card) {
                this.gameChat.addChatMessage('{0} {1}', player, card);

                return;
            }
        }

        this.gameChat.addChatMessage('{0} {1}', player, message);
    }

    concede(playerName) {
        var player = this.getPlayerByName(playerName);

        if(!player) {
            return;
        }

        this.addAlert('info', '{0} concedes', player);
        player.lost = true;

        let remainingPlayers = this.getPlayers().filter(player => !player.lost);

        if(remainingPlayers.length === 1) {
            this.recordWinner(remainingPlayers[0], 'concede');
        }
    }

    selectDeck(playerName, deck) {
        var player = this.getPlayerByName(playerName);

        if(!player) {
            return;
        }

        player.selectDeck(deck);
    }

    selectDeckForAutomaton(deck) {
        if(!this.automaton) {
            return;
        }

        this.automaton.selectDeck(deck);
    }

    discardFromDrawHand(playerName, discardType) {
        let player = this.getPlayerByName(playerName);
        const selectedCards = player.promptState.selectedCards;

        if(!player || !selectedCards || selectedCards.length === 0) {
            return;
        }

        let cards = selectedCards;
        if(discardType === 'keep') {
            cards = player.drawHand.filter(card => !selectedCards.includes(card));
        }
        player.discardCards(cards);
        this.addMessage('{0} discards {1} from draw hand', player, cards);
        this.clearDrawHandSelection(playerName);
    }

    clearDrawHandSelection(playerName) {
        let player = this.getPlayerByName(playerName);
        if(!player) {
            return;
        }
        player.clearSelectedCards();
        this.pipeline.clearSelectedCards(player);
    }

    shuffleDeck(playerName) {
        var player = this.getPlayerByName(playerName);
        if(!player) {
            return;
        }

        this.addAlert('danger', '{0} shuffles their deck', player);

        player.shuffleDrawDeck();
    }

    promptWithMenu(player, contextObj, properties) {
        this.queueStep(new MenuPrompt(this, player, contextObj, properties));
    }

    promptForCardName(properties) {
        this.queueStep(new CardNamePrompt(this, properties));
    }

    promptForSuit(player, title, method, context, source) {
        let buttonsSuit = ['Spades', 'Hearts', 'Clubs', 'Diams'].map(suit => {
            return { text: suit, method: method, arg: suit};
        });
        this.promptWithMenu(player, context, {
            activePrompt: {
                menuTitle: title,
                buttons: buttonsSuit
            },
            source: source
        });
    }

    promptForValue(player, title, method, context, source, condition = () => true) {
        this.queueStep(new ValuePrompt(this, player, title, method, context, source, condition));
    }   

    promptForSelect(player, properties) {
        this.queueStep(new SelectCardPrompt(this, player, properties));
    }

    promptForLocation(player, properties) {
        this.queueStep(new SelectLocationPrompt(this, player, properties));
    }

    promptForYesNo(player, properties) {
        this.queueStep(new ChooseYesNoPrompt(this, player, properties));
    }

    promptForDeckSearch(player, properties) {
        this.raiseEvent('onBeforeDeckSearch', { source: properties.source, player: player }, event => {
            this.queueStep(new DeckSearchPrompt(this, event.player, properties));
        });
    }

    promptForOpponentChoice(player, { condition = () => true, context, enabled, onSelect, onCancel }) {
        let finalCondition = (opponent, context) => opponent !== player && condition(opponent, context);

        this.queueStep(new ChoosePlayerPrompt(this, player, {
            context,
            enabled,
            onSelect,
            onCancel,
            condition: finalCondition,
            activePromptTitle: 'Select an opponent',
            waitingPromptTitle: 'Waiting for player to select an opponent'
        }));
    }

    menuButton(playerName, arg, method, promptId) {
        var player = this.getPlayerByName(playerName);
        if(!player) {
            return;
        }

        if(this.pipeline.handleMenuCommand(player, arg, method, promptId)) {
            return true;
        }
    }

    toggleTimerSetting(playerName, settingName, toggle) {
        var player = this.getPlayerByName(playerName);
        if(!player) {
            return;
        }

        player.timerSettings[settingName] = toggle;
    }

    togglePauseTimer() {
        this.timeLimit.togglePauseTimer();
    }

    initialise() {
        var players = {};

        for(let player of Object.values(this.playersAndSpectators)) {
            if(!player.left) {
                players[player.name] = player;
            }
        }

        this.playersAndSpectators = players;

        if(this.useGameTimeLimit) {
            let timeLimitStartType = 'whenFirstLowballRevealed';
            let timeLimitInMinutes = this.gameTimeLimit;
            this.timeLimit.initialiseTimeLimit(timeLimitStartType, timeLimitInMinutes);
        }

        for(let player of this.getPlayers()) {
            player.initialise();
        }

        this.pipeline.initialise([
            Phases.createStep('setup', this),
            new SimpleStep(this, () => this.beginRound())
        ]);

        this.playStarted = true;
        this.startedAt = new Date();

        this.round = 0;

        this.continue();
    }

    gatherAllCards() {
        this.allCards = this.getPlayers().reduce((cards, player) => {
            return cards.concat(player.preparedDeck.allCards);
        }, []);
    }

    checkForTimeExpired() {
        if(this.timeLimit.isTimeLimitReached && !this.finishedAt) {
            this.determineWinnerAfterTimeLimitExpired();
        }
    }

    beginRound() {
        // Reset phases to the standard game flow.
        this.remainingPhases = Phases.names();

        this.raiseEvent('onBeginRound');
        this.queueSimpleStep(() => {
            // Loop through individual phases, queuing them one at a time. This
            // will allow additional phases to be added.
            if(this.remainingPhases.length !== 0) {
                let phase = this.remainingPhases.shift();
                this.queueStep(Phases.createStep(phase, this));
                return false;
            }
        });
        this.queueStep(new SimpleStep(this, () => this.beginRound()));
    }

    addPhase(phase) {
        this.remainingPhases.unshift(phase);
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    queueSimpleStep(handler) {
        this.pipeline.queueStep(new SimpleStep(this, handler));
    }

    getCurrentPlayWindowName() {
        if(!this.currentPlayWindow) {
            return;
        }
        return this.currentPlayWindow.name;
    }

    isShootoutPlayWindow() {
        return this.getCurrentPlayWindowName() === 'shootout plays' || this.getCurrentPlayWindowName() === 'shootout resolution';
    }

    makePlayOutOfOrder(player, card, properties) {
        if(this.currentPlayWindow) {
            this.currentPlayWindow.makePlayOutOfOrder(player, card, properties);
        }        
    }

    markActionAsTaken(context) {
        if(this.currentPlayWindow) {
            if(!this.currentPlayWindow.doNotMarkActionAsTaken) {
                if(!context.player.equals(this.currentPlayWindow.currentPlayer)) {
                    this.addAlert('danger', '{0} uses {1} during {2}\'s turn in the {3} phase/step', context.player, context.source, this.currentPlayWindow.currentPlayer, this.getCurrentPlayWindowName());
                }
                if(context.ability) {
                    this.currentPlayWindow.markActionAsTaken(context.player);
                }
            } else {
                this.currentPlayWindow.onMakePlayDone();
            }
        } else if(this.currentPhase !== 'setup' || this.hasOpenReactionWindow()) {
            this.addAlert('danger', '{0} uses {1} outside of a play window', context.player, context.source);
        }
    }

    get currentAbilityContext() {
        if(this.abilityContextStack.length === 0) {
            return null;
        }

        return this.abilityContextStack[this.abilityContextStack.length - 1];
    }

    pushAbilityContext(context) {
        this.abilityContextStack.push(context);
    }

    popAbilityContext() {
        this.abilityContextStack.pop();
    }

    resolveAbility(ability, context) {
        this.queueStep(new AbilityResolver(this, ability, context));
    }

    resolveStandardAbility(ability, player, source) {
        let abilityContext = new AbilityContext({ 
            ability: ability,
            game: this, 
            source: source, 
            player: player
        });        
        this.queueStep(new AbilityResolver(this, ability, abilityContext));
    }

    openAbilityWindow(properties) {
        let windowClass = ['traitreaction', 'traitbeforereaction'].includes(properties.abilityType) ? TraitTriggeredAbilityWindow : TriggeredAbilityWindow;
        let window = new windowClass(this, { abilityType: properties.abilityType, event: properties.event });
        this.abilityWindowStack.push(window);
        this.queueStep(window);
        this.queueSimpleStep(() => this.abilityWindowStack.pop());
    }

    openReactionBeforeWindowForAttachedEvents(event) {
        let attachedEvents = [];
        for(let concurrentEvent of event.getConcurrentEvents()) {
            attachedEvents = attachedEvents.concat(concurrentEvent.attachedEvents);
            concurrentEvent.clearAttachedEvents();
        }

        if(attachedEvents.length === 0) {
            return;
        }

        let groupedEvent = new SimultaneousEvents();
        for(let attachedEvent of attachedEvents) {
            groupedEvent.addChildEvent(attachedEvent);
        }

        this.queueStep(new ReactionBeforeWindow(this, groupedEvent, () => this.postEventCalculations()));
    }

    registerAbility(ability, event) {
        let reverseStack = [...this.abilityWindowStack].reverse();
        let window = reverseStack.find(window => window.canTriggerAbility(ability));

        if(!window) {
            return;
        }

        window.registerAbility(ability, event);
    }

    clearAbilityResolution(ability) {
        for(let window of this.abilityWindowStack) {
            window.clearAbilityResolution(ability);
        }
    }

    hasOpenReactionWindow() {
        return this.abilityWindowStack.length !== 0;
    }

    before(eventName, handler, useOnce = true, condition = () => true) {
        let beforeHandler = { handler: handler, useOnce: useOnce, condition: condition };
        if(!this.beforeEventHandlers[eventName]) {
            this.beforeEventHandlers[eventName] = [beforeHandler];
        } else {
            this.beforeEventHandlers[eventName].push(beforeHandler);
        }
    }

    removeBefore(eventName, handler) {
        this.beforeEventHandlers[eventName] = this.beforeEventHandlers[eventName].filter(beforeHandler => 
            beforeHandler.handler !== handler);
        if(!this.beforeEventHandlers[eventName].length) {
            delete this.beforeEventHandlers[eventName];
        }
    }

    onceConditional(eventName, params, handler) {
        let updatedParams = Object.assign({ condition: () => true, until: 'onRoundEnded'}, params);
        let conditionalHandler = event => {
            if(!updatedParams.condition(event)) {
                this.onceConditional(eventName, updatedParams, handler);
                return;
            }
            handler(event);
        };
        this.once(eventName, conditionalHandler);
        this.once(updatedParams.until, () => this.removeListener(eventName, conditionalHandler));
        return conditionalHandler;
    }

    raiseEvent(eventName, params, handler) {
        if(!handler) {
            handler = () => true;
        }
        let event = new Event(eventName, params, handler);

        this.queueStep(new EventWindow(this, event, () => this.postEventCalculations()));
        return event;
    }

    /**
     * Raises multiple events whose resolution is performed atomically. Any
     * abilities triggered by these events will appear within the same prompt
     * for the player.
     */
    raiseAtomicEvent(events) {
        let event = new AtomicEvent();
        for(let childEventProperties of events) {
            let childEvent = new Event(childEventProperties.name, childEventProperties.params, childEventProperties.handler);
            event.addChildEvent(childEvent);
        }
        this.queueStep(new EventWindow(this, event, () => this.postEventCalculations()));
    }

    /**
     * Raises the same event across multiple cards as well as a wrapping plural
     * version of the event that lists all cards.
     */
    raiseSimultaneousEvent(cards, properties) {
        let event = new GroupedCardEvent(properties.eventName, Object.assign({ cards: cards }, properties.params), properties.handler, properties.postHandler);
        for(let card of cards) {
            let perCardParams = Object.assign({ card: card }, properties.params);
            let childEvent = new Event(properties.perCardEventName, perCardParams, properties.perCardHandler);
            event.addChildEvent(childEvent);
        }

        this.queueStep(new EventWindow(this, event, () => this.postEventCalculations()));
    }

    resolveEvent(event) {
        this.queueStep(new EventWindow(this, event, () => this.postEventCalculations()));
    }

    resolveGameAction(action, props) {
        if(!action.allow(props)) {
            return new NullEvent();
        }

        let event = action.createEvent(props);
        this.resolveEvent(event);
        return event;
    }

    /**
     * Function that executes after the handler for each Event has executed. In
     * terms of overall engine it is useful for things that require regular
     * checks, such as state dependent effects, attachment validity, and others.
     */
    postEventCalculations() {
        this.effectEngine.recalculateDirtyTargets();
        this.effectEngine.reapplyStateDependentEffects();
    }

    updateEffectsOnCard(card, predicate) {
        let effects = this.effectEngine.getAllEffectsOnCard(card, predicate);
        if(effects) {
            effects.forEach(effect => effect.updateAppliedTarget(card));
        }
    }

    isPhaseSkipped(name) {
        return !!this.skipPhase[name];
    }

    discardFromPlay(cards, callback = () => true, options, context) {
        let inPlayCards = cards.filter(card => card.location === 'play area');
        if(inPlayCards.length === 0) {
            return false;
        }

        // The player object used is irrelevant - it shouldn't be referenced by
        // any abilities that respond to cards being discarded from play. This
        // should be a temporary workaround until better support is added for
        // simultaneous resolution of events.
        inPlayCards[0].owner.discardCards(inPlayCards, callback, options, context);
        return true;
    }

    discardDrawHands() {
        this.getPlayers().forEach(player => player.discardDrawHand());
    }

    drawHands(numberToDraw = 5, context, reason) {
        this.getPlayers().forEach(player => player.drawCardsToDrawHand(numberToDraw, context, reason));
    }

    revealHands() {
        this.raiseEvent('onDrawHandsRevealed', { shootout: this.shootout }, () => {
            this.getPlayers().forEach(player => player.revealDrawHand());
        });
    }

    getAvailableKfDudes(context, needUnbooted = false) {
        const kfDudes = context.player.cardsInPlay.filter(card => 
            card.getType() === 'dude' &&
            card.canPerformTechnique(context.source) &&
            (!needUnbooted || !card.booted) &&
            (!context.ability.actionContext || card.allowGameAction(context.ability.actionContext.gameAction, context))
        );
        if(this.shootout) {
            if(context.ability.playTypePlayed(context) === 'shootout:join') {
                return kfDudes.filter(dude => !dude.isParticipating());
            }
            return kfDudes.filter(dude => dude.isParticipating());
        }
        return kfDudes;
    }

    takeControl(player, card, callback = () => true) {
        var oldController = card.controller;
        var newController = player;

        if(oldController.equals(newController)) {
            return;
        }

        if(!newController.canPutIntoPlay(card)) {
            return;
        }

        this.applyGameAction('takeControl', card, card => {
            const originalLocation = card.location;
            oldController.removeCardFromPile(card);
            oldController.allCards = oldController.allCards.filter(c => !c.equals(card));
            if(originalLocation === 'play area') {
                newController.cardsInPlay.push(card);
            }
            newController.allCards.push(card);
            card.controller = newController;
            if(this.shootout && card.getType() === 'dude' && card.isParticipating()) {
                if(this.shootout.isInLeaderPosse(card)) {
                    this.shootout.leaderPosse.removeFromPosse(card);
                    this.shootout.opposingPosse.addToPosse(card);
                } else {
                    this.shootout.opposingPosse.removeFromPosse(card);
                    this.shootout.leaderPosse.addToPosse(card);
                }
            }
            callback();
            this.raiseEvent('onCardTakenControl', { card: card });
        });
    }

    revertControl(card, controller) {
        if(card.location !== 'play area') {
            return;
        }

        card.controller.removeCardFromPile(card);
        if(!controller) {
            card.controller = card.owner;
        } else {
            card.controller = controller;
        }
        card.controller.cardsInPlay.push(card);

        this.raiseEvent('onCardTakenControl', { card: card });
    }

    getShootoutLocationCard() {
        if(!this.shootout || !this.shootout.shootoutLocation) {
            return new NullCard();
        }
        const locationCard = this.shootout.shootoutLocation.locationCard;
        return locationCard || new NullCard();
    }

    getShootoutGameLocation() {
        if(!this.shootout) {
            return new NullLocation();
        }
        return this.shootout.shootoutLocation;
    }

    isParticipatingInShootout(card) {
        if(!this.shootout) {
            return false;
        }
        return this.shootout.isInShootout(card);
    }

    // context is used for job - AbilityContext
    startShootout(leader, mark, context) {
        if(!this.shootout) {
            let options = {};
            if(context && context.ability.isJob) {
                options = { isJob: true, jobAbility: context.ability };
            }
            this.shootout = new Shootout(this, this.currentPhase, leader, mark, options);
        } else {
            // TODO M2 info that shootout is already happening
            return;
        }
        this.currentPhase = this.shootout.name.toLowerCase();
        this.queueStep(this.shootout);
    }

    endShootout(isCancel = false) {
        if(!this.shootout) {
            // TODO M2 info that shootout is not happening
            return;
        } 
        this.shootout = null;
        if(isCancel) {
            this.pipeline.cancelStep();
        }
    }

    applyGameAction(actionType, cards, func, options = {}) {
        let wasArray = Array.isArray(cards);
        if(!wasArray) {
            cards = [cards];
        }
        let allowed = options.force ? cards : cards.filter(card => card.allowGameAction(actionType));

        if(allowed.length === 0) {
            return;
        }

        if(wasArray) {
            func(allowed);
        } else {
            func(allowed[0]);
        }
    }

    watch(socketId, user) {
        if(!this.allowSpectators) {
            return false;
        }

        this.playersAndSpectators[user.username] = new Spectator(socketId, user);
        this.addAlert('info', '{0} has joined the game as a spectator', user.username);

        return true;
    }

    join(socketId, user) {
        if(this.started || this.getPlayers().length === 2) {
            return false;
        }

        this.playersAndSpectators[user.username] = new Player(socketId, user, this.owner === user.username, this);

        return true;
    }

    isEmpty() {
        return Object.values(this.playersAndSpectators).every(player => {
            if(player.left || player.id === 'TBA') {
                return true;
            }

            if(!player.disconnectedAt) {
                return false;
            }

            let difference = moment().diff(moment(player.disconnectedAt), 'seconds');

            return difference > 30;
        });
    }

    leave(playerName) {
        let player = this.playersAndSpectators[playerName];

        if(!player) {
            return;
        }

        this.addAlert('info', '{0} has left the game', player);

        if(player.isSpectator() || !this.started) {
            delete this.playersAndSpectators[playerName];
        } else {
            player.left = true;

            if(!this.finishedAt) {
                this.finishedAt = new Date();
            }
        }
    }

    disconnect(playerName) {
        var player = this.playersAndSpectators[playerName];

        if(!player) {
            return;
        }

        this.addAlert('warning', '{0} has disconnected.  The game will wait up to 30 seconds for them to reconnect', player);

        if(player.isSpectator()) {
            delete this.playersAndSpectators[playerName];
        } else {
            player.disconnectedAt = new Date();
        }

        player.socket = undefined;
    }

    failedConnect(playerName) {
        var player = this.playersAndSpectators[playerName];

        if(!player || player.connectionSucceeded) {
            return;
        }

        if(player.isSpectator() || !this.started) {
            delete this.playersAndSpectators[playerName];
        } else {
            this.addAlert('danger', '{0} has failed to connect to the game', player);

            player.disconnectedAt = new Date();

            if(!this.finishedAt) {
                this.finishedAt = new Date();
            }
        }
    }

    reconnect(socket, playerName) {
        var player = this.getPlayerByName(playerName);
        if(!player) {
            return;
        }

        player.id = socket.id;
        player.socket = socket;
        player.disconnectedAt = undefined;

        this.addAlert('info', '{0} has reconnected', player);
    }

    rematch() {
        if(!this.finishedAt) {
            this.finishedAt = new Date();
            this.winReason = 'rematch';
        }

        this.router.rematch(this);
    }

    timeExpired() {
        this.emit('onTimeExpired');
    }

    activatePersistentEffects() {
        this.effectEngine.activatePersistentEffects();
    }

    continue() {
        this.pipeline.continue();
    }

    passToNextPlayer() {
        if(this.currentPhase === PhaseNames.HighNoon) {
            this.pipeline.getCurrentStep().passToNextPlayer();
        }
    }

    getGameElementType() {
        return 'game';
    }

    getSaveState() {
        var players = this.getPlayers().map(player => {
            return {
                name: player.name,
                outfit: player.outfit.title || player.getFaction(),
                legend: player.legend ? player.legend.title : undefined,
                standaloneDeckId: player.standaloneDeckId
            };
        });

        return {
            id: this.savedGameId,
            gameId: this.id,
            startedAt: this.startedAt,
            players: players,
            winner: this.winner ? this.winner.name : undefined,
            winReason: this.winReason,
            finishedAt: this.finishedAt,
            soloScore: this.soloScore
        };
    }

    getState(activePlayerName) {
        let activePlayer = this.playersAndSpectators[activePlayerName] || new AnonymousSpectator();
        let playerState = {};
        let shootoutState = null;

        if(this.started) {
            for(let player of this.getPlayers()) {
                playerState[player.name] = player.getState(activePlayer);
            }

            if(this.shootout) {
                shootoutState = this.shootout.getState();
            }

            this.timeLimit.checkForTimeLimitReached();

            return {
                id: this.id,
                name: this.name,
                owner: this.owner,
                players: playerState,
                messages: this.gameChat.messages,
                gameType: this.gameType,
                showHand: this.showHand,
                shootout: shootoutState,
                spectators: this.getSpectators().map(spectator => {
                    return {
                        id: spectator.id,
                        name: spectator.name
                    };
                }),
                started: this.started,
                createdAt: this.createdAt,
                winner: this.winner ? this.winner.name : undefined,
                cancelPromptUsed: this.cancelPromptUsed,
                round: this.round,
                useGameTimeLimit: this.useGameTimeLimit,
                gameTimeLimitStarted: this.timeLimit.timeLimitStarted,
                gameTimeLimitStartedAt: this.timeLimit.timeLimitStartedAt,
                gameTimeLimitTime: this.timeLimit.timeLimitInSeconds
            };
        }

        return this.getSummary(activePlayerName);
    }

    getSummary(activePlayerName, options = {}) {
        var playerSummaries = {};

        for(let player of this.getPlayers()) {
            var deck = undefined;
            if(player.left) {
                return;
            }

            if(activePlayerName === player.name && player.deck) {
                deck = { name: player.deck.name, selected: player.deck.selected };
            } else if(player.deck) {
                deck = { selected: player.deck.selected };
            } else {
                deck = {};
            }

            playerSummaries[player.name] = {
                legend: player.legend ? player.legend.code : undefined,
                deck: deck,
                id: player.id,
                lobbyId: player.lobbyId,
                left: player.left,
                name: player.name,
                owner: player.owner,
                user: options.fullData && player.user
            };
        }

        return {
            allowSpectators: this.allowSpectators,
            createdAt: this.createdAt,
            gameType: this.gameType,
            id: this.id,
            messages: this.gameChat.messages,
            name: this.name,
            owner: this.owner,
            players: playerSummaries,
            showHand: this.showHand,
            started: this.started,
            startedAt: this.startedAt,
            spectators: this.getSpectators().map(spectator => {
                return {
                    id: spectator.id,
                    lobbyId: spectator.lobbyId,
                    name: spectator.name
                };
            })
        };
    }

    determineWinnerAfterTimeLimitExpired() {

    }
}

module.exports = Game;
