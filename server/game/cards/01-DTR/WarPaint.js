const ActionCard = require('../../actioncard.js');

class WarPaint extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'War Paint',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select your dude who applies war paint',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to give {2} +2 bullets', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(2)
                }));
            }
        });
    }
}

WarPaint.code = '01116';

module.exports = WarPaint;
