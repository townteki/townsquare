const SpellCard = require('../../spellcard.js');
const GameActions = require('../../GameActions/index.js');

class Intercession extends SpellCard {
    setupCardAbilities(ability) {
        this.spellReaction({
            when: {
                onDudeBecomesStud: event => event.card.controller !== this.controller
            },
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            target: {
                cardCondition: card => card.controller === this.controller && card.location === 'play area',
                cardType: 'dude'
            },
            onSuccess: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
                this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, context.target);
            }
        });
        
        this.spellAction({
            title: 'Intercession',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            targets: {
                myDude: {
                    activePromptTitle: 'Select your dude',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.location === 'play area' && card.getType() === 'dude' && card.isParticipating() && card.controller === this.controller
                },
                theirDude: {
                    activePromptTitle: 'Select an opposing dude',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.location === 'play area' && card.getType() === 'dude' && card.isParticipating() && card.isOpposing(this.controller)
                }
            },
            onSuccess: (context) => {
                if(context.targets.myDude.booted) {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.targets.myDude })).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.targets.myDude);
                    });
                }
                    
                if(context.targets.theirDude.booted) {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.targets.theirDude })).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.targets.theirDude);
                    });
                }    
                    
                this.applyAbilityEffect(context.ability, ability => ({
                    match: [ 
                        context.targets.myDude,
                        context.targets.theirDude
                    ],
                    effect: ability.effects.modifyBullets(2)
                }));
                
                this.game.addMessage('{0} uses {1} to give {2} and {3} +2 Bullets', context.player, this, context.targets.myDude, context.targets.theirDude);
            },
            source: this
        });
    }
}

Intercession.code = '19038';

module.exports = Intercession;
