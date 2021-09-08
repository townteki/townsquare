const GoodsCard = require('../../goodscard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class DoomsdaySupply extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction(card => this.game.isHome(card.uuid, this.controller));

        this.action({
            title: 'Noon/Shootout: Doomsday Supply',
            playType: ['noon', 'shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardSelf()
            ],
            target: {
                activePromptTitle: 'Select goods card',
                cardCondition: { 
                    location: 'discard pile', 
                    controller: 'current', 
                    condition: (card, context) => 
                        card !== this &&
                        context.player.getSpendableGhostRock({ 
                            activePlayer: context.player,
                            context 
                        }) >= card.cost - 2
                },
                cardType: ['goods']
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller &&
                        (!this.game.shootout || card.isParticipating()),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playType: 'ability',
                            abilitySourceType: 'card',
                            targetParent: dude,
                            reduceAmount: 2
                        }, () => {
                            this.game.addMessage('{0} uses {1} to attach {2} from discard pile to {3}', 
                                player, this, context.target, dude);
                        }), player, context.target);
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

DoomsdaySupply.code = '16013';

module.exports = DoomsdaySupply;
