const DeedCard = require('../../deedcard.js');

class TheMayorsOffice extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Mayor\'s Office',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                cardCondition: {
                    location: 'play area', 
                    condition: card => (card.gamelocation === this.gamelocation || card.isAdjacent(this.gamelocation))
                },
                cardType: 'dude',
                gameAction: { or: ['increaseInfluence', 'decreaseInfluence'] }
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Raise or lower the dude\'s influence?',
                        buttons: [
                            {
                                text: 'Raise by one',
                                method: 'raise',
                                disabled: !this.abilityContext.target.allowGameAction('increaseInfluence', this.abilityContext)
                            },
                            {
                                text: 'Lower by one',
                                method: 'lower',
                                disabled: !this.abilityContext.target.allowGameAction('decreaseInfluence', this.abilityContext)
                            }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    raise(player) {
        this.applyInfluenceEffects(player, 1);
        return true;
    }

    lower(player) {
        this.applyInfluenceEffects(player, -1);
        return true;
    }

    applyInfluenceEffects(player, amount) {
        let text = 'raise';
        if(amount < 0) {
            text = 'lower';
        }
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: [
                ability.effects.modifyInfluence(amount)
            ]
        }));
        this.game.addMessage('{0} uses {1} to {2} {3}\'s influence by 1', player, this, text, this.abilityContext.target);
    }
}

TheMayorsOffice.code = '04012';

module.exports = TheMayorsOffice;
