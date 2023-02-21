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
            message: context => this.game.addMessage('{0} uses {1} to suppress {2}', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.selectAsFirstCasualty(this)
                    ]
                }));
                let eventHandler = event => {
                    if(event.card === context.target) {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: [
                                ability.effects.modifyBullets(-3)
                            ]
                        }), context.causedByPlayType);
                    }
                };
                this.game.on('onShooterPicked', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onShooterPicked', eventHandler));
            }
        });
    }
}

PinnedDown.code = '01124';

module.exports = PinnedDown;
