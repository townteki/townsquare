const DudeCard = require('../../dudecard.js');

class VasilisTheBoar extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: card => card.getType() === 'dude' && card.isOpposing(this.controller) && card.isWanted(),
            effect: [
                ability.effects.modifyValue(-2)
            ]
        });
        this.action({
            title: 'Vasilis the Boar',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose Vasilis\' weapon to use',
                cardCondition: { location: 'play area' },
                cardType: ['goods']
            },
            handler: context => {
                context.target.useAbility(context.player, { 
                    doNotMarkActionAsTaken: true,
                    allowUsed: true,
                    skipCost: cost => cost.action.name === 'boot',
                    callback: () => context.player.aceCard(context.target, false)
                });
            }
        });
    }
}

VasilisTheBoar.code = '13006';

module.exports = VasilisTheBoar;
