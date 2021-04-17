const DudeCard = require('../../dudecard.js');

class MicahRyseExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Micah Ryse (Exp.1)',
            playType: ['shootout'],
            cost: ability.costs.boot({
                type: ['spell', 'goods'],
                condition: card => card.parent === this && (card.isHex() || card.hasKeyword('mystical'))
            }),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to give {2} -3 value', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyValue(-3)
                }));            
            }
        });   
    }
}

MicahRyseExp1.code = '05007';

module.exports = MicahRyseExp1;
