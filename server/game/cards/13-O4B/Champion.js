const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Champion extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Cheatin\' Resolution: Champion',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.game.addMessage('{0} uses {1} to gain 1 GR', context.player, this);
                context.player.modifyGhostRock(1);
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Champion',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => 
                    card.controller === this.controller &&
                    card.getType() === 'dude' &&
                    card.isParticipating())
            ],
            difficulty: 8,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.costs.boot,
                    effect: ability.effects.setAsStud()
                }));
                const eventHandler = () => {
                    context.player.modifyGhostRock(1);
                    this.game.addMessage('{0} gains 1 GR thanks to {1}', context.player, this);
                };
                this.game.onceConditional('onCardAced', {
                    condition: event => event.card === context.costs.boot
                }, () => context.player.modifyGhostRock(1));
                this.game.onceConditional('onCardDiscarded', {
                    condition: event => event.card === context.costs.boot
                }, () => context.player.modifyGhostRock(1));
                this.game.on('onShootoutPhaseFinished', () => {
                    this.game.removeListener('onCardAced', eventHandler);
                    this.game.removeListener('onCardDiscarded', eventHandler);
                });
            },
            source: this
        });
    }
}

Champion.code = '21049';

module.exports = Champion;
