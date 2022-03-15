const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Scattergun extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Discard Sidekick or Token',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose Sidekick or Token',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    participating: true,
                    condition: card => (card.isToken() || card.hasKeyword('sidekick')) &&
                        card.cost <= this.parent.bullets
                },
                gameAction: 'discard'
            },
            ifCondition: () => this.parent && this.parent.bullets >= 1,
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} to discard {2}, but it fails because {3} does not have enough bullets', 
                    context.player, this, context.target, this.parent),
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
            }
        });
        
        this.action({
            title: 'Shootout: Prevent dude from contributing',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: card => card.influence === 0 
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent {2} from contributing to draw hand bonuses unless they are a shooter', 
                    context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    condition: () => !this.isDudeAShooter(context.target),
                    match: context.target,
                    effect: ability.effects.doesNotProvideBulletRatings()
                }));
            }
        });
    }

    isDudeAShooter(dude) {
        if(!this.game.shootout) {
            return false;
        }
        const leaderPosse = this.game.shootout.leaderPosse;
        const oppPosse = this.game.shootout.opposingPosse;
        return (leaderPosse && leaderPosse.shooter.equals(dude)) ||
            (oppPosse && oppPosse.shooter.equals(dude));
    }
}

Scattergun.code = '21045';

module.exports = Scattergun;
