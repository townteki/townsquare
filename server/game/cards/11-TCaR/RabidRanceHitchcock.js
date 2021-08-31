const DudeCard = require('../../dudecard.js');

class RabidRanceHitchcock extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => this.locationCard.owner !== this.controller,
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyControl(1)
        });

        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => this.determineProductionBonus()),
                ability.effects.canMoveWithoutBooting(this, moveOptions => 
                    moveOptions.origin.isHome(this.controller) &&
                    moveOptions.destination.locationCard.isOutOfTown() 
                )
            ]
        });
    }

    determineProductionBonus() {
        if(this.locationCard.getType() !== 'deed') {
            return 0;
        }
        return this.locationCard.production < 3 ? this.locationCard.production : 3;
    }
}

RabidRanceHitchcock.code = '19015';

module.exports = RabidRanceHitchcock;
