const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const JobAction = require('../../jobaction.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AntoinePeterson extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Antoine Peterson',
            when: {
                onCardEntersPlay: event => event.card === this
            },
            target: {
                activePromptTitle: 'Select a Job action',
                cardCondition: { 
                    location: 'discard pile', 
                    controller: 'current', 
                    condition: card => this.checkIfJobAction(card) 
                },
                cardType: ['action'],
                ifAble: true
            },
            handler: context => {
                let foundJob = context.target;
                if(!context.target || !context.player.moveCardWithContext(context.target, 'hand', context)) {
                    foundJob = null;
                }
                context.player.discardFromHand(1, discarded => {
                    if(foundJob) {
                        this.game.addMessage('{0} uses {1} to get {2} from discard pile and discards {3}', 
                            context.player, this, foundJob, discarded);
                    } else {
                        this.game.addMessage('{0} uses {1} to discards {2}', context.player, this, discarded);
                    }
                }, {}, context);
                const bootedDudesAtHome = this.game.getDudesAtLocation(context.player.getOutfitCard().uuid, dude => dude.booted);
                if(bootedDudesAtHome.length) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose a dude to unboot',
                        cardCondition: card => bootedDudesAtHome.includes(card),
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.unbootCard({ card }), context);
                            this.game.resolveGameAction(GameActions.addBounty({ card, amount: 2 }), context);
                            this.game.addMessage('{0} uses {1} to unboot {2} and give them 2 bounty', player, this, card);
                            return true;
                        },
                        source: this
                    });
                }
            }
        });
    }

    checkIfJobAction(card) {
        if(card.getType() !== 'action') {
            return false;
        }
        return card.abilities.actions.some(action => {
            if(action instanceof JobAction) {
                return true;
            }
            return false;
        });
    }    
}

AntoinePeterson.code = '16008';

module.exports = AntoinePeterson;
