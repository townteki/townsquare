const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class FanninTheHammer extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Fannin \' the Hammer',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    if(context.target.bullets > 0) {
                        context.ability.selectAnotherTarget(context.player, context, {
                            activePromptTitle: 'Select dudes',
                            waitingPromptTitle: 'Waiting for opponent to select dudes',
                            cardCondition: card => card.controller !== this.controller && card.isParticipating(),
                            cardType: 'dude',
                            multiSelect: true,
                            numCards: context.target.bullets,
                            onSelect: (player, cards) => {
                                this.game.addMessage('{0} uses {1} and boots {2} to give {3} -1 bullets', 
                                    context.player, this, context.target, cards);
                                this.applyAbilityEffect(context.ability, ability => ({
                                    match: cards,
                                    effect: ability.effects.modifyBullets(-1)
                                }));
                                const zeroBulletDudes = cards.filter(card => card.getPrintedStat('bullets') === 0);
                                if(zeroBulletDudes.length > 0) {
                                    this.game.addMessage('{0} uses {1} to set {2} as draw', context.player, this, zeroBulletDudes);
                                    this.applyAbilityEffect(context.ability, ability => ({
                                        match: zeroBulletDudes,
                                        effect: ability.effects.setAsDraw()
                                    }));
                                }
                                return true;
                            },
                            source: this
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} and boots {2}, but it does not have any effect', 
                            context.player, this, context.target);
                    }
                });
            }
        });
    }
}

FanninTheHammer.code = '22051';

module.exports = FanninTheHammer;
