const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class BaiYangChenExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards()
        });
        this.traitReaction({
            when: {
                onCardAbilityResolved: event => this.isParticipating() && 
                    event.ability.playTypePlayed() === 'shootout',
                onPassAction: event => this.isParticipating() &&
                    event.playWindow.name === 'shootout plays'
            },
            handler: context => {
                this.removeEffects(effect => effect.gameAction === 'increaseBullets' ||
                    effect.gameAction === 'decreaseBullets'
                );
                this.bullets = this.getPrintedStat('bullets');
                this.lastingEffect(ability => ({
                    until: {
                        onShootoutPhaseFinished: () => true
                    },
                    condition: () => this.isParticipating(),
                    match: this,
                    effect: ability.effects.modifyBullets(-context.player.hand.length)
                }));
            }
        });
        this.action({
            title: 'Bai Yang Chen',
            playType: ['noon'],
            ifCondition: context => context.player.ghostrock === 0,
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but does not draw a card because he has {2} GR in stash', 
                    context.player, this, context.player.ghostrock),
            message: context => this.game.addMessage('{0} uses {1} to draw a card', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.drawCards({
                    player: context.player,
                    amount: 1
                }), context);
            }
        });
    }
}

BaiYangChenExp1.code = '23003';

module.exports = BaiYangChenExp1;
