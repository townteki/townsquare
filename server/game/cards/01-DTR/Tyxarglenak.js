const DudeCard = require('../../dudecard.js');

// TODO M2 Tyx will be more difficult to implement as we have to check if he can be targeted before
// preventing to select hucksters. And that is only if the action is targeting one card.
// If there is more card, we cannot just prevent to target hucksters as they can be selected/targeted
// once Tyx is targeted. But we have to make sure hucksters are not targeted without the Tyx being also targeted.
// When implemented, just update the code to 01012
class Tyxarglenak extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area',
            match: card => card.getType() === 'dude' && card.hasKeyword('huckster') && card.gamelocation === this.gamelocation,
            effect: [
                ability.effects.cannotBeTargeted('opponent', context => 
                    context.targetBeingResolved.selector.canTarget(this, context) &&
                    context.source && 
                    context.source.getType() === 'action')
            ]
        });
    }
}

Tyxarglenak.code = 'x01012x';

module.exports = Tyxarglenak;
