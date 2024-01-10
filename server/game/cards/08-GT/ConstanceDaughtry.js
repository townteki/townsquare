const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions/index.js');
const DudeCard = require('../../dudecard.js');

class ConstanceDaughtry extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => (this.game.currentPhase === PhaseNames.HighNoon || this.game.currentPhase === PhaseNames.Shootout) &&
                this.locationCard && this.locationCard.getType() === 'deed' && this.locationCard.hasKeyword('Government'),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });

        this.reaction({
            title: 'Unboot Constance Daughtry',
            when: {
                onCardAbilityResolved: event => event.source.getType() == 'outfit' &&
                    event.source.controller.equals(this.controller) && event.ability.printed
            },
            actionContext: { card: this, gameAction: 'unboot' },
            message: context => this.game.addMessage('{0} has {1} unboot herself', context.player, this),
            handler: context => this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context)
        });
    }
}

ConstanceDaughtry.code = '14006';

module.exports = ConstanceDaughtry;
