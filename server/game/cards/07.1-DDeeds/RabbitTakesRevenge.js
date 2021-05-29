const TechniqueCard = require('../../techniquecard.js');

class RabbitTakesRevenge extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Rabbit Takes Revenge',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            onSuccess: (context) => {
                this.game.addMessage('{0} uses {1} to set {2} as draw and {3} as stud. Both cannot leave this shootout', 
                    context.player, this, context.target, context.kfDude);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setAsDraw(),
                        ability.effects.cannotLeaveShootout()
                    ]
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.kfDude,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.cannotLeaveShootout()
                    ]
                }));
                if(context.comboNumber > 0) {
                    this.game.addMessage('{0} uses {1} as combo to boot all attachments on {2} and they must be selected as first casualty', 
                        context.player, this, context.target);
                    if(context.target.attachments.length > 0) {
                        context.player.bootCards(context.target.attachments, context);                
                    }
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: [
                            ability.effects.selectAsFirstCasualty()
                        ]
                    }));                    
                }
            },
            source: this
        });
    }
}

RabbitTakesRevenge.code = '11023';

module.exports = RabbitTakesRevenge;
