const DudeCard = require('../../dudecard.js');

class NicodemusWhateley extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.getType() === 'dude' && card.locationCard.getType() === 'deed' && !card.locationCard.isOutOfTown(),
            effect: ability.effects.addCardAction({
                title: 'Give Nicodemus Whateley a control point',
                playType: ['noon'],
                cost: ability.costs.bootSelf(),
                condition: context => context.source.influence >= 1,
                message: context => this.game.addMessage('{0} uses {1} to give {2} a control point', context.player, this),
                handler: context => {
                    if(this.control < 3) {
                        this.modifyControl(1);
                        if(this.isAtHome()) {
                            this.control = 0;
                        }
                    } else {
                        this.game.addMessage('{0} cannot to give {1} a control point since he already has 3 or more', context.player, this);
                    }
                }
            })
        });
        this.traitReaction({
            when: {
                onRoundEnded: () => this.location === 'play area',
                onDudeEnteredLocation: event => event.card === this && event.gameLocation.isHome(this.controller)
            },
            handler: () => this.control = 0
        });
    }
}

NicodemusWhateley.code = '05019';

module.exports = NicodemusWhateley;
