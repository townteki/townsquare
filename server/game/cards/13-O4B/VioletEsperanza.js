const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class VioletEsperanza extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Violet Esperanza',
            playType: ['shootout'],
            condition: () => this.isParticipating() && 
                this.controller === this.game.shootout.leaderPlayer &&
                this.game.shootout.isJob(),
            cost: [
                ability.costs.ace(card => card.parent === this && card.hasKeyword('hex')),
                ability.costs.pull()
            ],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    participating: true,
                    condition: card => card.bullets < this.bounty
                },
                gameAction: 'ace',
                cardType: ['dude']
            },
            handler: context => {
                if(context.pull.pulledValue > context.target.value) {
                    this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} and aces {2} to ace {3}', context.player, this, context.costs.ace, context.target);
                    });
                } else {
                    this.game.addMessage('{0} uses {1} and aces {2} in attempt to ace {3} but nothing happens', 
                        context.player, this, context.costs.ace, context.target);                  
                }
            }
        });
    }
}

VioletEsperanza.code = '21033';

module.exports = VioletEsperanza;
