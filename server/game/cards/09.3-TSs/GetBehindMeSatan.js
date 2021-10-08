const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class GetBehindMeSatan extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Get Behind Me, Satan!',
            playType: 'resolution',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: context => {
                const blessedRating = this.parent.getSkillRating('blessed');
                this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                    player: context.player,
                    amount: blessedRating
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to reduce casualties by {2}', context.player, this, blessedRating);
                });                
                let opponentPosse = this.game.shootout.getPosseByPlayer(context.player.getOpponent());
                if(opponentPosse && opponentPosse.findInPosse(dude => dude.hasKeyword('abomination'))) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select an abomination',
                        waitingPromptTitle: 'Waiting for opponent to select an abomination',
                        cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.controller && 
                        card.isParticipating() &&
                        card.hasKeyword('abomination'),
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            let eventHandler = () => this.lastingEffect(context.ability, ability => ({
                                until: {
                                    onShootoutRoundFinished: () => true
                                },
                                match: card,
                                effect: ability.effects.doesNotProvideBulletRatings()
                            }));
                            this.game.addMessage('{0} uses {1} to prevent {2} from contributing to draw and stud ratings', context.player, this, card);
                            this.game.once('onShootoutRoundStarted', eventHandler);
                            this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onShootoutRoundStarted', eventHandler));                 
                            return true;
                        }
                    });
                }
            },
            source: this
        }); 
    }
}

GetBehindMeSatan.code = '17016';

module.exports = GetBehindMeSatan;
