const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SecretPaths extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Secret Paths',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: { cardType: 'location' },
            difficulty: 8,
            onSuccess: (context) => {
                const dudesToMove = this.game.getDudesAtLocation(this.gamelocation, 
                    dude => dude.controller === context.player && !dude.booted);
                const movedDudes = [];
                let action = GameActions.simultaneously(
                    dudesToMove.map(card => GameActions.moveDude({
                        card,
                        targetUuid: context.target.uuid,
                        options: { allowBooted: false }
                    }).thenExecute(() => movedDudes.push(card)))
                );
                this.game.resolveGameAction(action, context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, movedDudes, context.target);
                });
            },
            source: this
        });
    }
}

SecretPaths.code = '22050';

module.exports = SecretPaths;
