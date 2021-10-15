const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HandsomeDanDeeds extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: context => {
                const thisLocationCard = this.locationCard;
                if(!thisLocationCard) {
                    return false;
                }
                return thisLocationCard.owner === context.player && 
                    this.isAtDeed('in-town') &&
                    thisLocationCard.control < 2;
            },
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but it fails because Dan is not at in-town deed with less than 2 CP', 
                    context.player, this),
            message: context =>
                this.game.addMessage('{0} uses {1} to give 1 CP to {2} until Sundown', 
                    context.player, this, this.locationCard),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onSundownAfterVictoryCheck: () => true
                    },
                    match: this.locationCard,
                    effect: ability.effects.modifyControl(1)
                }));
                this.game.onceConditional('onDudeMoved', { 
                    condition: event => event.card === this
                }, () => this.danMoved = true);
                this.game.once('onSundownAfterVictoryCheck', () => {
                    const thisLocationCard = this.locationCard;
                    if(!this.danMoved && this.controller.getSpendableGhostRock() >= 4) {
                        this.game.promptForYesNo(this.controller, {
                            title: 'Do you want to pay 4 GR?',
                            onYes: player => {
                                player.spendGhostRock(4);
                                thisLocationCard.modifyControl(1);
                                this.game.addMessage('{0} uses {1} and pays 4 GR to make the 1 CP on {2} permanent', 
                                    context.player, this, thisLocationCard);
                            },
                            source: this
                        });
                    }
                    this.danMoved = false;
                });
            }
        });
    }

    leavesPlay() {
        super.leavesPlay();
        this.danMoved = true;
    }

    entersPlay() {
        super.entersPlay();
        this.danMoved = false;
    }
}

HandsomeDanDeeds.code = '20023';

module.exports = HandsomeDanDeeds;
