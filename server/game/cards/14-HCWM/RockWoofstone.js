const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RockWoofstone extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Rock Woofstone',
            playType: ['noon'],
            cost: ability.costs.payGhostRock(1, true),
            repeatable: true,
            actionContext: { card: this, gameAction: 'moveDude' },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({
                    card: this,
                    targetUuid: this.game.townsquare.uuid
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} and pays 1 GR to move him to Town Square', context.player, this);
                });
            }
        });
    }
}

RockWoofstone.code = '22005';

module.exports = RockWoofstone;
