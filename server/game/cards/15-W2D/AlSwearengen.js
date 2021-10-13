const AbilityDsl = require('../../AbilityDsl');
const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

const actionTitle = 'Noon: Al Swearengen';

class AlSwearengen extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: actionTitle,
            playType: ['noon'],
            cost: ability.costs.payGhostRock(4),
            message: context => 
                this.game.addMessage('{0} uses {1} to get permanent +1 bullet , +1 influence and make himself a stud', 
                    context.player, this),
            handler: () => {
                this.modifyBullets(1);
                this.modifyInfluence(1);
                this.addStudEffect(this.uuid, 'Stud');
                this.abilities.actions = this.abilities.actions.filter(action => action.title !== actionTitle);
            }
        });
    }

    leavesPlay() {
        super.leavesPlay();
        if(!this.abilities.actions.some(action => action.title === actionTitle)) {
            this.setupCardAbilities(AbilityDsl);
        }
    }
}

AlSwearengen.code = '23007';

module.exports = AlSwearengen;
