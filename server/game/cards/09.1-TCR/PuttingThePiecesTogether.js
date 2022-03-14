const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class PuttingThePiecesTogether extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.traitReaction({
            location: 'play area',
            ignoreActionCosts: true,            
            when: {
                onDrawHandsRevealed: () => this.controller.isCheatin()
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this}), context).thenExecute(() => {
                    this.game.addMessage('{0} boots {1} because they revealed an illegal hand', context.player, this);
                });
            }
        });

        this.persistentEffect({
            location: 'play area',
            condition: () => !!this.parent && this.game.shootout,
            match: player => player.equals(this.controller),
            effect: ability.effects.dynamicHandRankMod(() => this.booted ? -1 : 1)
        });

        this.action({
            title: 'Noon: Putting The Pieces Together',
            playType: ['noon'],
            message: context => 
                this.game.addMessage('{0} uses {1} to attach it to their home booted', context.player, this),
            handler: context => {
                context.player.attach(this, this.controller.getOutfitCard(), 'ability', () => {
                    this.booted = true;
                });
            }
        });
    }
}

PuttingThePiecesTogether.code = '15019';

module.exports = PuttingThePiecesTogether;
