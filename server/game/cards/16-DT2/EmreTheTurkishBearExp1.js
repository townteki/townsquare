const DudeCard = require('../../dudecard.js');

// TODO M2 use repeatableShootout once it is implemented
class EmreTheTurkishBearExp1 extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Emre, The Turkish Bear',
            repeatable: true,
            when: {
                onPullSuccess: event => this.game.shootout && !this.reactUsed && 
                    event.pullingDude === this &&
                    event.source && event.source.hasKeyword('technique')
            },
            handler: context => {
                this.reactUsed = true;
                context.player.drawCardsToHand(1, context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.modifyBullets(1)
                    ]
                }));
                this.game.once('onShootoutPhaseFinished', () => this.reactUsed = false);
            }
        });
    }
}

EmreTheTurkishBearExp1.code = '24019';

module.exports = EmreTheTurkishBearExp1;
