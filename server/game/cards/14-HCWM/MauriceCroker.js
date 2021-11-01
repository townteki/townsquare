const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MauriceCroker extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Maurice Croker',
            playType: ['shootout'],
            ifCondition: () => {
                if(!this.game.shootout) {
                    return false;
                }
                const myPosse = this.game.shootout.getPosseByPlayer(this.controller);
                return myPosse.getDudes(dude => dude.isStud()).length === 0;
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not have any effect because there is stud in {1}\'s posse', 
                    context.player, this),
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: 'setAsDraw'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to make {2} a draw', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsDraw()
                }));
            }
        });
    }
}

MauriceCroker.code = '22013';

module.exports = MauriceCroker;
