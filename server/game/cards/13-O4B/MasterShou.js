const DudeCard = require('../../dudecard.js');

class MasterShou extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Master Shou',
            playType: ['noon'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.controller === this.controller &&
                card.hasKeyword('abomination') &&
                card.isAtDeed() &&
                card.isNearby(this.gamelocation)
            ),
            message: context => {
                const deedOwner = context.target.locationCard.owner;
                if(context.target.locationCard.owner === this.controller) {
                    this.game.addMessage('{0} uses {1} and boots {2}, but they are the deed owners', 
                        context.player, this, context.costs.boot);
                } else {
                    this.game.addMessage('{0} uses {1} and boots {2} to make {3} pay them 1 GR', 
                        context.player, this, context.costs.boot, deedOwner);
                }
            },
            handler: context => {
                if(context.target.locationCard.owner !== this.controller) {
                    this.game.transferGhostRock({
                        from: context.target.locationCard.owner,
                        to: this.controller,
                        amount: 1
                    });
                }                
            }
        });
    }
}

MasterShou.code = '21012';

module.exports = MasterShou;
