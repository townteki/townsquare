const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class CoinneachKenCarn extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: [
                ability.effects.dynamicControl(() => this.factionsCheck())
            ]
        });
    }

    factionsCheck() {
        const dudes = this.controller.cardsInPlay.filter(card => card.getType() === 'dude');
        const factions = [];
        const multiFactionDudes = dudes.filter(dude => dude.gang_code.length > 1);
        let remainingMultiFactions = [];
        for(const dude of multiFactionDudes) {
            const dudeFactions = dude.gang_code.filter(code => !factions.includes(code));
            if(dudeFactions.length > 1) {
                remainingMultiFactions.push(dudeFactions);
                continue;
            }
            if(dudeFactions.length === 1) {
                factions.push(dudeFactions[0]);
            }
        }
        for(const multiFaction of remainingMultiFactions) {
            const otherMultiFactions = remainingMultiFactions.filter(remainingMultiFaction => remainingMultiFaction !== multiFaction);
            let savedCode;
            for(const code of multiFaction.gang_code) {
                if(!factions.includes(code)) {
                    if(!this.includesInMultiFactions(code, otherMultiFactions)) {
                        factions.push(code);
                        remainingMultiFactions = otherMultiFactions;
                        break;
                    }
                    savedCode = code;
                }
            }
            if(savedCode) {
                factions.push(savedCode);
            }
        }
        return factions.length;
    }   

    includesInMultiFactions(code, multiFactions) {
        return multiFactions.find(multiFaction => multiFaction.includes(code));
    }
}

CoinneachKenCarn.code = '25029';

module.exports = CoinneachKenCarn;
