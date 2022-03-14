const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class AdrianVallejo extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'React: Adrián Vallejo',
            when: {
                onDudeMoved: event => this.game.shootout && event.options.context && 
                    event.options.context.ability && event.options.context.ability.isCardAbility() && 
                    !this.equals(event.card) &&
                    !this.isParticipating() &&
                    event.target === this.game.shootout.shootoutLocation.uuid &&
                    event.options.toPosse &&
                    this.hasHorse()
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to have him join their posse', context.player, this);
                });
            }
        });
    }
}

AdrianVallejo.code = '19013';

module.exports = AdrianVallejo;
