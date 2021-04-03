const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ChargingBear extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Charging Bear',
            playType: ['shootout'],
            condition: () => !this.booted,
            targets: {
                toAce: {
                    activePromptTitle: 'Select token dude to ace',
                    cardCondition: { location: 'play area', condition: card => card.isToken() },
                    cardType: ['dude'],
                    gameAction: 'ace'
                },
                toBootHome: {
                    activePromptTitle: 'Select an opposing dude to send home booted',
                    cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                    cardType: ['dude'],
                    gameAction: ['sendHome', 'boot', 'removeFromPosse']
                }
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to ace {2}, send {3} home booted, and make {1} a stud', context.player, this, context.targets.toAce, context.targets.toBootHome);
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.targets.toAce }), context);
                this.game.shootout.sendHome(context.targets.toBootHome);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

ChargingBear.code = '19006';

module.exports = ChargingBear;
