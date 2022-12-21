const uuid = require('uuid');

const BaseAbilityWindow = require('./BaseAbilityWindow');
const ReactTimer = require('./ReactTimer');
const TriggeredAbilityWindowTitles = require('./TriggeredAbilityWindowTitles');

class TriggeredAbilityWindow extends BaseAbilityWindow {
    constructor(game, properties) {
        super(game, properties);

        this.reactTimer = new ReactTimer(this.event, this.abilityType);
        this.forceReactPerPlayer = {};

        for(let player of game.getPlayersInFirstPlayerOrder()) {
            if(this.reactTimer.isEnabled(player)) {
                this.forceReactPerPlayer[player.name] = true;
            }
        }
    }

    continue() {
        if(this.hasAttachedEvents()) {
            this.openWindowForAttachedEvents();
            return false;
        }

        this.gatherChoices();

        this.players = this.filterChoicelessPlayers(this.players || this.game.getPlayersInFirstPlayerOrder());

        if(this.players.length === 0 || this.abilityChoices.length === 0 && !this.forceReactPerPlayer[this.players[0].name]) {
            return true;
        }

        this.promptPlayer(this.players[0]);

        return false;
    }

    filterChoicelessPlayers(players) {
        return players.filter(player => this.reactTimer.isEnabled(player) ||
            this.abilityChoices.some(abilityChoice => abilityChoice.player === player && !abilityChoice.ability.usage.isUsed()));
    }

    promptPlayer(player) {
        let choicesForPlayer = this.abilityChoices.filter(choice => choice.player === player);
        let cardsForPlayer = choicesForPlayer.map(choice => choice.card);

        if(player === this.game.automaton) {
            if(this.game.automaton.decideReacts(cardsForPlayer[0], this.event)) {
                let choice = choicesForPlayer.find(choice => choice.card === cardsForPlayer[0]);
                this.chooseAbility(choice);
            }
        } else {
            this.game.promptForSelect(player, {
                activePromptTitle: TriggeredAbilityWindowTitles.getTitle(this.abilityType, this.event.getPrimaryEvent()),
                isCardEffect: false,
                cardCondition: card => cardsForPlayer.includes(card),
                cardType: ['dude', 'deed', 'action', 'goods', 'spell', 'outfit', 'legend'],
                additionalButtons: this.getButtons(player),
                additionalControls: this.getAdditionalPromptControls(),
                doneButtonText: 'Pass',
                onSelect: (player, card) => {
                    let choice = choicesForPlayer.find(choice => choice.card === card);
                    this.chooseAbility(choice);
                    return true;
                },
                onCancel: () => this.pass(),
                onMenuCommand: (player, arg) => {
                    if(arg === 'pass') {
                        this.pass();
                    } else if(arg === 'passAndPauseForRound') {
                        player.disableTimerForRound();
                        this.pass();
                    }

                    return true;
                }
            });
        }

        this.forceReactPerPlayer[player.name] = false;
    }

    getButtons(player) {
        const buttons = [];

        if(this.reactTimer.isEnabled(player)) {
            buttons.push({ timer: true, arg: 'pass', id: uuid.v1() });
            buttons.push({ text: 'I need more time', timerCancel: true });
            buttons.push({ text: 'Don\'t ask again until end of round', timerCancel: true, arg: 'passAndPauseForRound' });
        }

        return buttons;
    }

    getAdditionalPromptControls() {
        let controls = [];
        for(let event of this.event.getConcurrentEvents()) {
            if(event.name === 'onCardAbilityInitiated' && event.targets.length > 0) {
                controls.push({
                    type: 'targeting',
                    source: event.source.getShortSummary(),
                    targets: event.targets.map(target => target.getShortSummary())
                });
            } else if(event.name === 'onTargetsChosen') {
                let targets = event.targets ? event.targets.getTargets() : event.cards;
                if(!Array.isArray(targets)) {
                    targets = [targets];
                }
                controls.push({
                    type: 'targeting',
                    source: event.ability.card.getShortSummary(),
                    targets: targets.map(target => target.getShortSummary())
                });
            }
        }

        return controls;
    }

    chooseAbility(choice) {
        this.resolveAbility(choice.ability, choice.context);

        // Always rotate player order without filtering, in case an ability is
        // triggered that could then make another ability eligible after it is
        // resolved.
        this.players = this.rotatedPlayerOrder(choice.player);
    }

    pass() {
        this.players.shift();
        return true;
    }

    rotatedPlayerOrder(player) {
        let players = this.game.getPlayersInFirstPlayerOrder();
        let splitIndex = players.indexOf(player);
        let beforePlayer = players.slice(0, splitIndex);
        let afterPlayer = players.slice(splitIndex + 1);
        return afterPlayer.concat(beforePlayer).concat([player]);
    }
}

module.exports = TriggeredAbilityWindow;
