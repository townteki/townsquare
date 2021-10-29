const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WrathfulSpider extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Cheatin\' Resolution: Wrathful Spider',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            actionContext: { card: this.getOpposingShooter(), gameAction: ['sendHome', 'boot']},
            difficulty: 5,
            onSuccess: (context) => {
                const oppShooter = this.getOpposingShooter();
                if(!oppShooter) {
                    return;
                }
                this.game.shootout.sendHome(oppShooter, context)
                    .thenExecute(() => this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, oppShooter));                
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Wrathful Spider',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose opposing dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            difficulty: 6,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
                if(context.totalPullValue - 6 >= context.difficulty) {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context)
                        .thenExecute(() => 
                            this.game.addMessage('{0} uses {1} to give {2} -1 bullets and boot them', context.player, this, context.target));
                } else {
                    this.game.addMessage('{0} uses {1} to give {2} -1 bullets', context.player, this, context.target);
                }                
            },
            source: this
        });
    }

    getOpposingShooter() {
        const opponentPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!opponentPosse) {
            return null;
        }
        return opponentPosse.shooter;
    }
}

WrathfulSpider.code = '21047';

module.exports = WrathfulSpider;
