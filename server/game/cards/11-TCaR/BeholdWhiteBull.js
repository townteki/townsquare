const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BeholdWhiteBull extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.techniqueAction({
            title: 'Shootout: Behold White Bull',
            playType: ['shootout'],
            cost: ability.costs.bootKfDude(),
            onSuccess: (context) => {
                this.game.getPlayers().forEach(player =>
                    this.game.resolveGameAction(GameActions.increaseCasualties({ 
                        player: player,
                        amount: context.kfDude.influence
                    }), context)
                );
                this.game.addMessage('{0} uses {1} to increase casualties for both posses by {2}', 
                    context.player, this, context.kfDude.influence);
                this.game.promptForYesNo(context.player.getOpponent(), {
                    title: 'Do you want to send your Dudes home booted?',
                    onYes: player => {
                        this.game.shootout.actOnPlayerPosse(player, card => {
                            this.game.shootout.sendHome(card, context);
                        });
                        context.kfDude.modifyControl(2);
                        this.game.resolveGameAction(GameActions.unbootCard({ card: context.kfDude }), context);
                        this.game.addMessage('{0} uses {1} to unboot {2} and give them 2 CP because {3} decided to send their dudes home booted', 
                            context.player, this, context.kfDude, context.player.getOpponent());
                    },
                    source: this
                });              
            },
            source: this
        });
    }
}

BeholdWhiteBull.code = '19041';

module.exports = BeholdWhiteBull;
