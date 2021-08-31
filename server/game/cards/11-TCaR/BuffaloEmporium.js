const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class BuffaloEmporium extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Buffalo Emporium',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.gamelocation === this.uuid 
                },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.cannotBeMovedViaCardEffects(),
                        ability.effects.cannotBeBooted('opponent', context => 
                            context.ability && context.ability.isCardAbility())
                    ]
                }));
                if(context.target.hasKeyword('abomination')) {
                    if(context.target.booted) {
                        this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                        this.game.addMessage('{0} uses {1} to unboot {2}, prevent them from being booted or moved by opposing card effects ' +
                            ' and to give {0} +1 stud posse bonus while {2} is in the posse', context.player, this, context.target);
                    } else {
                        this.game.addMessage('{0} uses {1} to prevent {2} from being booted or moved by opposing card effects ' +
                            ' and to give {0} +1 stud posse bonus while {2} is in the posse', context.player, this, context.target);
                    }
                    this.applyAbilityEffect(context.ability, ability => ({
                        condition: () => context.target.isParticipating() && 
                            context.target.controller === context.player,
                        match: context.player,
                        effect: ability.effects.modifyPosseStudBonus(1)
                    }));
                } else {
                    this.game.addMessage('{0} uses {1} to prevent {2} from being booted or moved by opposing card effects', 
                        context.player, this, context.target);
                }           
            }
        });
    }
}

BuffaloEmporium.code = '19023';

module.exports = BuffaloEmporium;
