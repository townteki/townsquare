const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ReverendBobHungate extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Reverend Bob Hungate',
            playType: ['resolution'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(context => context.target.influence, true, 
                    context => this.minInfInPosse(context))
            ],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true,
                    condition: (card, context) => 
                        context.player.getSpendableGhostRock({ 
                            activePlayer: context.player,
                            context 
                        }) >= card.influence
                },
                cardType: ['dude']
            },
            handler: context => {
                this.untilEndOfShootoutRound(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.cannotBeChosenAsCasualty()
                }));
                context.ability.selectAnotherTarget(context.player.getOpponent(), context, {
                    activePromptTitle: 'Choose a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === context.player.getOpponent() &&
                        card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, oppDude) => {
                        this.untilEndOfShootoutRound(context.ability, ability => ({
                            match: oppDude,
                            effect: ability.effects.cannotBeChosenAsCasualty()
                        }));
                        this.game.addMessage('{0} uses {1} and pays {2} GR to {3} to prevent {4} and {5} from being chosen as casualties', 
                            context.player, this, context.target.influence, player, context.target, oppDude);
                        return true;
                    },
                    onCancel: player => {
                        this.game.addMessage('{0} uses {1} and pays {2} GR to {3} to prevent {4} from being chosen as casualty, ' +
                            'but {3} cancelled their selection', context.player, this, context.target.influence, player, context.target);
                    },
                    source: this
                });
            }
        });
    }

    minInfInPosse(context) {
        const posse = this.game.shootout.getPosseByPlayer(context.player);
        if(!posse) {
            return 0;
        }
        return posse.getDudes().reduce((minInf, dude) => {
            if(dude.influence > minInf) {
                return minInf;
            }
            return dude.influence;
        }, 999);
    }
}

ReverendBobHungate.code = '21010';

module.exports = ReverendBobHungate;
