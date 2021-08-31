const DudeCard = require('../../dudecard.js');

class ValeriaBattenExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.canPerformSkillUsing('huckster', card => card.hasAllOfKeywords(['gadget', 'mystical']))
        });

        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: this.game.getPlayers(),
            effect: [
                ability.effects.cannotModifyHandRanks(this, context => context.ability && 
                    ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context)))
            ]
        });

        this.action({
            title: 'Valeria Batten (Exp.1)',
            playType: ['noon'],
            cost: ability.costs.boot(card => card.location === 'play area' &&
                card.getType() === 'dude' &&
                card.controller === this.controller),
            message: context => this.game.addMessage('{0} uses {1} and boots {2} to give them +1 influence', 
                context.player, this, context.costs.boot),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.costs.boot,
                    effect: ability.effects.modifyInfluence(1)
                }));
            }
        });
    }
}

ValeriaBattenExp1.code = '21037';

module.exports = ValeriaBattenExp1;
