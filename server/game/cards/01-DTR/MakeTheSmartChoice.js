const ActionCard = require('../../actioncard.js');

class MakeTheSmartChoice extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Make the Smart Choice',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                // "Reduce a dude's bullets by their influence."
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1 * context.target.influence)
                }));
                // "The dude's controller may move them home booted."
                context.game.promptForYesNo(context.target.controller, {
                    title: 'Send home booted?',
                    onYes: () => this.game.shootout.sendHome(context.target, context)
                });
            }
        });
    }
}

MakeTheSmartChoice.code = '01109';

module.exports = MakeTheSmartChoice;
