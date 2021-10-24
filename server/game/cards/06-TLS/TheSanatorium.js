const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheSanatorium extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: The Sanatorium',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            }, 
            handler: context => {
                this.abilityContext = context;
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose an opposing dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.owner &&
                        card.isNearby(context.target.gamelocation),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.game.promptWithMenu(player, this, {
                            activePrompt: {
                                menuTitle: `Choose bonus for ${context.target.title}`,
                                buttons: [
                                    { text: '+1 Influence', method: 'sanatoriumBonus', arg: 'inf' },
                                    { text: '+1 Huckster skill', method: 'sanatoriumBonus', arg: 'huck' }
                                ]
                            },
                            source: this
                        });
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: card,
                            effect: [
                                ability.effects.modifyBullets(-1),
                                ability.effects.modifyValue(-1)
                            ]
                        }));
                        this.game.addMessage('{0} uses {1} to give {2} -1 bullets and -1 value', 
                            context.player, this, card);
                        return true;
                    }
                });
            }
        });
    }

    sanatoriumBonus(player, arg) {
        if(arg === 'inf') {
            this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                match: this.abilityContext.target,
                effect: ability.effects.modifyInfluence(1)
            }));
            this.game.addMessage('{0} uses {1} to give {2} +1 influence', 
                this.abilityContext.player, this, this.abilityContext.target);
        }
        if(arg === 'huck') {
            this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                match: this.abilityContext.target,
                effect: ability.effects.modifySkillRating('huckster', 1)
            }));
            this.game.addMessage('{0} uses {1} to give {2} +1 huckster skill', 
                this.abilityContext.player, this, this.abilityContext.target);
        }
        return true;
    }
}

TheSanatorium.code = '10001';

module.exports = TheSanatorium;
