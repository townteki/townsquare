const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class TLCJohnYarbrough extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard sidekick or a horse',
            playType: ['noon', 'shootout'],
            target: {
                activePromptTitle: 'Select Horse or Sidekick to discard',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.hasOneOfKeywords(['horse', 'sidekick']) &&
                        (!this.game.shootout || card.isParticipating())
                },
                cardType: ['goods', 'spell'],
                gameAction: 'discard'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: [
                            ability.effects.modifyBullets(1),
                            ability.effects.modifyInfluence(1),
                            ability.effects.setAsStud()
                        ]
                    }));
                    if(this.controller.equals(context.target.controller)) {
                        this.untilEndOfPhase(context.ability, ability => ({
                            match: this,
                            effect: ability.effects.modifyUpkeep(-1 * this.upkeep)
                        }), PhaseNames.Upkeep
                        );
                        this.game.addMessage('{0} uses {1} to discard {2}, give {1} +1 bullets, +1 influence and reduce his upkeep to 0', 
                            context.player, this, context.target);                         
                    } else {
                        this.game.addMessage('{0} uses {1} to discard {2} and give {1} +1 bullets and +1 influence', 
                            context.player, this, context.target);                        
                    }
                });
            }
        });
    }
}

TLCJohnYarbrough.code = '25025';

module.exports = TLCJohnYarbrough;
