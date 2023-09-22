const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LiveryStables extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Give dude +/- 1 bullet',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to modify bullets by 1',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    participating: true,
                    condition: card => card.hasHorse()
                },
                cardType: ['dude'],
                gameAction: { or: ['increaseBullets', 'decreaseBullets'] }
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Raise or lower bullets (by 1)?',
                        buttons: [
                            { 
                                text: 'Raise', 
                                method: 'raise',
                                disabled: !this.abilityContext.target.allowGameAction('increaseBullets', context)
                            },
                            { 
                                text: 'Lower', 
                                method: 'lower',
                                disabled: !this.abilityContext.target.allowGameAction('decreaseBullets', context)
                            }
                        ]
                    },
                    source: this
                });                
            }
        });
    }

    raise(player) {
        this.applyBulletEffects(player, 1);
        return true;
    }

    lower(player) {
        this.applyBulletEffects(player, -1);
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
        this.game.addMessage('{0} uses {1} to {2} {3}\'s bullets by 1', player, this, text, this.abilityContext.target);
    }    
}

LiveryStables.code = '25031';

module.exports = LiveryStables;
