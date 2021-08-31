const SpellCard = require('../../spellcard.js');

class GetBehindMeSatan extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Get Behind Me, Satan!',
            playType: 'resolution',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: context => {
                context.player.modifyCasualties(-this.parent.getSkillRating('blessed'));
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
