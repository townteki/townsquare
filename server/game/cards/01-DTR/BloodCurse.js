const SpellCard = require('../../spellcard.js');

class BloodCurse extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Blood Curse',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to be cursed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => 
                        card.gamelocation === this.gamelocation ||
                        card.isAdjacent(this.gamelocation)
                },
                cardType: ['dude']
            },
            difficulty: 9,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-1),
                        ability.effects.modifyInfluence(-1)
                    ]
                }));
                this.game.addMessage('{0} cursed {1} using {2} who gets -1 influence and -1 bullets', context.player, context.target, this);         
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Blood Curse',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to be cursed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true
                },
                cardType: ['dude'],
                gameAction: 'decreaseBullets'
            },
            difficulty: 9,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-2)
                    ]
                }));    
                this.game.addMessage('{0} cursed {1} using {2} who gets -2 bullets', context.player, context.target, this);            
            },
            source: this
        });
    }
}

BloodCurse.code = '01103';

module.exports = BloodCurse;
