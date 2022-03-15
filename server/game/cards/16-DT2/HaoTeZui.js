const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HaoTeZui extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.getFaction() === Factions.Anarchists, 
            effect: ability.effects.reduceSelfCost('any', () => this.getNumOfDiffLocations())
        });

        this.action({
            title: 'Shootout: Discard goods',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose goods to discard',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['goods'],
                gameAction: 'discard'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
            }
        });
    }

    getNumOfDiffLocations() {
        const numberOfLocations = this.game.getPlayers().reduce((locAgg, player) => {
            return locAgg + player.locations.reduce((agg, loc) => {
                if(loc.getDudes(dude => dude.controller.equals(this.controller)).length) {
                    return agg + 1;
                }
                return agg;
            }, 0);
        }, 0);
        if(this.game.townsquare.getDudes(dude => dude.controller.equals(this.controller)).length) {
            return numberOfLocations + 1;
        }
        return numberOfLocations;
    }
}

HaoTeZui.code = '24025';

module.exports = HaoTeZui;
