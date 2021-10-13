const ActionCard = require('../../actioncard.js');

class TummyTwister extends ActionCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.parent && this.parent.getType() === 'dude',
            match: this.parent,
            effect: ability.effects.modifyUpkeep(1)
        });
        this.traitReaction({
            when: {
                onDudeMoved: event => this.parent && this.parent.getType() === 'deed' &&
                    event.target === this.parent.gamelocation
            },
            handler: context => {
                const saveDeed = this.parent;
                context.player.attach(this, event.card, 'ability', () => {
                    this.game.addMessage('{0} contracts {1} at {2}', event.card, this, saveDeed);
                });
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
                    this.game.addMessage('{0} uses {1}, infecting {2}', context.player, this, context.target);
                });
            }
        });
    }
}

TummyTwister.code = '10037';

module.exports = TummyTwister;
