const ActionCard = require('../../actioncard.js');

class TummyTwister extends ActionCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent && this.parent.getType() === 'dude',
            effect: ability.effects.modifyUpkeep(1)
        });

        this.traitReaction({
            location: 'play area',
            ignoreActionCosts: true,
            when: {
                onDudeMoved: event => this.parent && this.parent.getType() === 'deed' &&
                    event.target === this.parent.gamelocation && 
                    (!event.parentEvent || event.parentEvent.activeChildEvents.find(event => 
                        event.name === 'onDudeMoved') === event)
            },
            handler: context => {
                this.saveDeed = this.parent;
                if(context.event.parentEvent) {
                    const buttons = context.event.parentEvent.activeChildEvents
                        .filter(event => event.name === 'onDudeMoved' && event.target === this.saveDeed.gamelocation)
                        .map(event => { 
                            return { text: event.card.title, method: 'tummyTwisterInfect', arg: event.card.uuid };
                        });
                    if(buttons.length === 1) {
                        this.tummyTwisterInfect(context.player, context.event.card.uuid);
                    } else {
                        this.game.promptWithMenu(this.game.getFirstPlayer(), this, {
                            activePrompt: {
                                menuTitle: 'What Dude will get Tummy Twister?',
                                buttons
                            },
                            source: this
                        });
                    }
                } else {
                    this.tummyTwisterInfect(context.player, context.event.card.uuid);
                }
            }
        });

        this.action({
            title: 'Tummy Twister',
            playType: 'noon',
            condition: () => !this.parent,
            target: {
                activePromptTitle: 'Select deed to infect',
                cardCondition: { location: 'play area', controller: 'any'},
                cardType: 'deed'
            },
            handler: context => {
                context.player.attach(this, context.target, 'ability', () => {
                    this.game.addMessage('{0} uses {1} to infect {2}', context.player, this, context.target);
                });
            }
        });
    }

    tummyTwisterInfect(player, arg) {
        const cardToBeInfected = this.game.findCardInPlayByUuid(arg);
        cardToBeInfected.controller.attach(this, cardToBeInfected, 'ability', () => {
            this.game.addMessage('{0}\'s dude {1} contracts {2} at {3}', 
                cardToBeInfected.controller, cardToBeInfected, this, this.saveDeed);
        });
        return true;
    }
}

TummyTwister.code = '10037';

module.exports = TummyTwister;
