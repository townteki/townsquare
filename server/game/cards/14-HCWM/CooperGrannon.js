const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class CooperGrannon extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Cooper Grannon',
            playType: ['noon'],
            cost: [
                ability.costs.boot(card => card.parent &&
                    card.parent === this &&
                    card.hasKeyword('gadget')),
                ability.costs.pull()
            ],
            handler: context => {
                const pulls = [context.pull];
                if(context.costs.boot.hasKeyword('experimental')) {
                    context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                        pulls.push({ pulledCard, pulledValue, pulledSuit });
                        this.grannonPullsHandler(pulls, context);
                    }, true, { context });                    
                } else {
                    this.grannonPullsHandler(pulls, context);
                }
            }
        });
    }

    grannonPullsHandler(pulls, context) {
        pulls.forEach(pull => {
            switch(pull.pulledSuit.toLowerCase()) {
                case 'diams':
                    this.game.resolveGameAction(GameActions.drawCards({
                        player: context.player,
                        amount: 1
                    }), context).thenExecute(() => {
                        context.player.discardFromHand(1, discarded =>
                            this.game.addMessage('{0} uses {1} to draw a card and discard {2}', 
                                context.player, this, discarded),
                        {}, context);
                    });
                    break;
                case 'hearts':
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.modifyBullets(2)
                    }));
                    this.game.addMessage('{0} uses {1} to give himself +2 bullets', 
                        context.player, this);
                    break;
                case 'spades':
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.modifyInfluence(1)
                    }));
                    this.game.addMessage('{0} uses {1} to give himself +1 influence', 
                        context.player, this);
                    break;
                case 'clubs':
                    this.game.resolveGameAction(GameActions.bootCard({ card: this }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to boot himself because the experiment failed', 
                            context.player, this);
                    });
                    break;            
                default:
                    break;
            }
        });
    }
}

CooperGrannon.code = '22011';

module.exports = CooperGrannon;
