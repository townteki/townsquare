const DudeCard = require('../../dudecard.js');

class NicodemusWhateley extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.getType() === 'dude' && card.locationCard.getType() === 'deed' && !card.locationCard.isOutOfTown(),
            effect: ability.effects.addCardAction({
                title: 'Give Nicodemus Whateley a Control Point',
                playType: ['noon'],
                cost: ability.costs.bootSelf(),
                condition: context => context.source.influence >= 1,
                message: context => this.game.addMessage('{0} uses {1} to give {2} a CP', context.player, context.source, this),
                handler: context => {
                    if(this.control < 3) {
                        this.modifyControl(1);
                        if(this.isAtHome()) {
                            this.removeAllControl();
                        }
                    } else {
                        this.game.addMessage('{0} cannot to give {1} a CP since he already has 3 or more', context.player, this);
                    }
                }
            })
        });
        this.traitReaction({
            when: {
                onRoundEnded: () => this.location === 'play area',
                onDudeEnteredLocation: event => event.card === this && event.gameLocation.isHome(this.controller)
            },
            handler: () => this.removeAllControl()
        });
    }
}

NicodemusWhateley.code = '05019';

module.exports = NicodemusWhateley;
