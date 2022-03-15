const DudeCard = require('../../dudecard.js');

class JohnnyBrocklehurst extends DudeCard {
    entersPlay() {
        super.entersPlay();
        this.game.addAlert('warning', '{0}\'s React ability has to be used as a regular Noon ability ' +
            'that is triggered from the menu', this);
    }

    setupCardAbilities() {
        this.action({
            title: 'Johnny Brocklehurst',
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any', condition: card => !this.game.shootout || card.isParticipating() },
                cardType: ['dude']
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Raise or lower the influence?',
                        buttons: [
                            {
                                text: 'Raise by one',
                                method: 'raise'
                            },
                            {
                                text: 'Lower by one',
                                method: 'lower'
                            }
                        ]
                    },
                    source: this
                });
                this.game.makePlayOutOfOrder(context.player, this);  
            }
        });
    }

    raise(player) {
        this.applyInfEffect(player, 1);
        return true;
    }

    lower(player) {
        this.applyInfEffect(player, -1);
        return true;
    }

    applyInfEffect(player, amount) {
        let text = '+1';
        if(amount < 0) {
            text = '-1';
        }
        let eventHandler = event => {
            this.lastingEffect(this.abilityContext.ability, ability => ({
                until: {
                    onAbilityResolutionFinished: resolvedEvent => event.ability === resolvedEvent.ability
                },
                match: this.abilityContext.target,
                effect: ability.effects.modifyInfluence(amount)
            }), this.abilityContext.causedByPlayType);
            this.game.addMessage('{0}\'s dude {1} get {2} influence due to the {3} ability', 
                this.abilityContext.target.controller, this.abilityContext.target, text, this);
        };
        this.game.onceConditional('onAbilityResolutionStarted', { 
            condition: event => event.context.player.equals(this.abilityContext.player) && event.ability.isAction()
        }, eventHandler);
        this.game.addMessage('{0} uses {1} to give {2} {3} influence for the duration of next play', player, this, this.abilityContext.target, text);
    }
}

JohnnyBrocklehurst.code = '19017';

module.exports = JohnnyBrocklehurst;
