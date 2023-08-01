const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HarlanStanton extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.locationCard && this.locationCard.hasKeyword('ranch'),
            match: this,
            effect: ability.effects.setAsStud()
        });
        
        this.action({
            title: 'Shootout: Harlan Stanton',
            playType: ['shootout:join'],
            actionContext: { card: this, gameAction: 'joinPosse' },
            ifCondition: () => this.game.getShootoutLocationCard().hasKeyword('ranch'),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not have any effect because shootout is not at Ranch', 
                    context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to join him to posse', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context);
            }
        });
    }
}

HarlanStanton.code = '22009';

module.exports = HarlanStanton;
