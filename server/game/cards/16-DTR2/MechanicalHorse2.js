const GameActions = require('../../GameActions');
const GoodsCard = require('../../goodscard');

class MechanicalHorse2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Move dude',
            playType: ['noon'],
            cost: ability.costs.payXGhostRock(() => this.isAnyLocationAdjacent() ? 1 : 2, () => 2, 'ability'),
            repeatable: true,
            target: {
                activePromptTitle: 'Choose location to move to',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: (card, context) => {
                        if(card.gamelocation === this.gamelocation) {
                            return false;
                        }
                        if(context.grCost === 1) {
                            return card.isAdjacent(this.parent.gamelocation);
                        }
                        return true;
                    }
                },
                cardType: ['location']
            },
            actionContext: { card: this.parent, gameAction: 'moveDude '},
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, this.parent, context.target.title),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context);
            }
        });
        this.reaction({
            title: 'React: Prevent booting',
            when: {
                onDudeJoiningPosse: event => 
                    event.card === this.parent && 
                    this.parent.requirementsToJoinPosse().needToBoot
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent {2} from booting when joining posse', context.player, this, this.parent),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPossesGathered: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.parent,
                    effect: ability.effects.canJoinWithoutBooting()
                }));
            }
        });
    }

    isAnyLocationAdjacent() {
        const adjLocationCards = this.game.filterCardsInPlay(card => ['deed', 'outfit'].includes(card.getType()) && card.isAdjacent(this.gamelocation));
        return (adjLocationCards && adjLocationCards.length > 0) || this.game.townsquare.isAdjacent(this.gamelocation);
    }
}

MechanicalHorse2.code = '25224';

module.exports = MechanicalHorse2;
