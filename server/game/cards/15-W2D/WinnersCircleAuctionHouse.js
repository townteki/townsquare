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
        let controllerDudeCount = 0;
        let oppDudeCount = 0;

        const gameLocation = this.getGameLocation();
        if(!gameLocation) {
            return 0;
        }

        const controllerDudes = gameLocation.getDudes().find(dude => dude.controller === this.controller);
        if(controllerDudes) {
            controllerDudeCount = 1;
        }

        const oppDudes = gameLocation.getDudes().find(dude => dude.controller === this.controller.getOpponent());
        if(oppDudes) {
            oppDudeCount = 1;
        }

        return controllerDudeCount + oppDudeCount;
    }
}

WinnersCircleAuctionHouse.code = '23036';

module.exports = WinnersCircleAuctionHouse;
