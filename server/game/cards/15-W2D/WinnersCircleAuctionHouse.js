const DeedCard = require('../../deedcard.js');

class WinnersCircleAuctionHouse extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: ability.effects.dynamicControl(() => this.dudeCheck())
        });
    }

    dudeCheck() {
        const gameLocation = this.getGameLocation();
        if(!gameLocation) {
            return 0;
        }
        return this.game.getPlayers().reduce((aggregate, player) => {
            if(gameLocation.getDudes().find(dude => dude.controller === player)) {
                return aggregate + 1;
            }
            return aggregate;
        }, 0);
    }
}

WinnersCircleAuctionHouse.code = '23036';

module.exports = WinnersCircleAuctionHouse;
