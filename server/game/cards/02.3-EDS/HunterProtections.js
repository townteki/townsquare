const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class HunterProtections extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Hunter Protections',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.getType() === 'dude' &&
                    card.control <= 0 && 
                    card.locationCard === this
                )
            ],
            message: context =>
                this.game.addMessage('{0} uses {1} to protect {2} who boots, gets 2 bounty and 1 permanent CP', 
                    context.player, this, context.costs.boot),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.costs.boot, amount: 2 }), context);
                context.costs.boot.modifyControl(1);             
            }
        });
    }
}

HunterProtections.code = '04013';

module.exports = HunterProtections;
