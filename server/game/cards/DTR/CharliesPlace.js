const DeedCard = require('../../deedcard.js');

class CharliesPlace extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Charlie\'s Place',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to raise or lower bullets by 2',
                cardCondition: { location: 'play area', controller: 'any', condition: card => card.locationCard === this },
                cardType: ['dude']
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Raise or lower bullets (by 2)?',
                        buttons: [
                            { text: 'Raise by 2', method: 'raise' },
                            { text: 'Lower by 2', method: 'lower' }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    raise(player) {
        this.applyBulletEffects(player, 2);
        return true;
    }

    lower(player) {
        this.applyBulletEffects(player, -2);
        return true;
    }

    applyBulletEffects(player, amount) {
        let text = 'raise';
        if(amount < 0) {
            text = 'lower';
        }
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: [
                ability.effects.modifyBullets(amount)
            ]
        }));
        this.game.addMessage('{0} uses {1} to {2} {3}\'s bullets by 2.', player, this, text, this.abilityContext.target);
    }
}

CharliesPlace.code = '01063';

module.exports = CharliesPlace;
