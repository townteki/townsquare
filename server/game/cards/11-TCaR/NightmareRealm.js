const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NightmareRealm extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout: Nightmare Realm',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            difficulty: 3,
            onSuccess: (context) => {
                this.untilEndOfShootoutRound(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.cannotLeaveShootout()
                }));
                let eventHandler = () => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: [
                            ability.effects.modifyBullets(-1),
                            ability.effects.modifyValue(-1)
                        ]
                    }));
                };
                this.game.on('onShooterToBePicked', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onShooterToBePicked', eventHandler));             
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(1)
                }));
            },
            source: this
        });
    }
}

NightmareRealm.code = '19033';

module.exports = NightmareRealm;
