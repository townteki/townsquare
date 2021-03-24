const ActionCard = require('../../actioncard.js');

class PinnedDown extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Pinned Down',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to suppress {2}', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.selectAsFirstCasualty()
                    ]
                }));
                this.game.on('onShooterPicked', event => {
                    if(event.card === context.target) {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: [
                                ability.effects.modifyBullets(-3)
                            ]
                        }));
                    }
                });
            }
        });
    }
}

PinnedDown.code = '01124';

module.exports = PinnedDown;
