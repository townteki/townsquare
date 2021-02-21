const BaseAbilityWindow = require('./BaseAbilityWindow');
const TriggeredAbilityWindowTitles = require('./TriggeredAbilityWindowTitles');

class TraitTriggeredAbilityWindow extends BaseAbilityWindow {
    continue() {
        if(this.hasAttachedEvents()) {
            this.openWindowForAttachedEvents();
            return false;
        }

        this.gatherChoices();

        if(this.abilityChoices.length === 1) {
            let abilityChoice = this.abilityChoices[0];
            this.resolveAbility(abilityChoice.ability, abilityChoice.context);
            return false;
        }

        if(this.abilityChoices.length > 1) {
            this.promptAbility();
            return false;
        }

        return true;
    }

    promptAbility() {
        let player1 = this.game.getFirstPlayer();
        let player1Abilities = this.abilityChoices.filter(abilityChoice => abilityChoice.player === player1);

        if(player1Abilities.length > 0) {
            this.promptPlayerAbilities(player1, player1Abilities);
            return;
        }

        if(player1Abilities.length !== this.abilityChoices.length) {
            let player2 = this.game.getFirstPlayer().getOpponent();
            let player2Abilities = this.abilityChoices.filter(abilityChoice => abilityChoice.player === player2);       
            this.promptPlayerAbilities(player2, player2Abilities);
        }
    }

    promptPlayerAbilities(player, abilityChoices) {
        if(abilityChoices.length === 1) {
            let abilityChoice = abilityChoices[0];
            this.resolveAbility(abilityChoice.ability, abilityChoice.context);
        } else {
            let buttons = abilityChoices.map(abilityChoice => {
                return { text: abilityChoice.card.title, method: 'chooseAbility', arg: abilityChoice.id, card: abilityChoice.card };
            }).sort((a, b) => a.text > b.text ? 1 : -1);
            this.game.promptWithMenu(player, this, {
                activePrompt: {
                    menuTitle: TriggeredAbilityWindowTitles.getTitle(this.abilityType, this.event.getPrimaryEvent()),
                    buttons: buttons
                },
                waitingPromptTitle: 'Waiting for opponents to resolve traits'
            });
        }        
    }

    chooseAbility(player, id) {
        let choice = this.abilityChoices.find(ability => ability.id === id);

        if(!choice) {
            return false;
        }
        this.resolveAbility(choice.ability, choice.context);

        return true;
    }
}

module.exports = TraitTriggeredAbilityWindow;
