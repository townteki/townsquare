const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MurderedInTombstone extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Murdered in Tombstone',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
                this.game.getPlayers().forEach(player => {
                    this.game.resolveGameAction(
                        GameActions.search({
                            title: 'Select a Cheatin\' Resolution card to take',
                            player,
                            match: { 
                                type: 'action',
                                condition: card => this.checkIfCheatinResAction(card)
                            },
                            location: ['discard pile', 'draw deck'],
                            numToSelect: 1,
                            message: {
                                format: '{player} plays {source} and searches their draw deck and discard pile to put {searchTarget} into their hand'
                            },
                            cancelMessage: {
                                format: '{player} plays {source} and searches their draw deck and discard pile, but does not find a anything'
                            },
                            handler: card => {
                                player.moveCardWithContext(card, 'hand', context);
                                player.discardFromHand(1, discarded => 
                                    this.game.addMessage('{0} uses {1} to discard {2} from their hand', context.player, this, discarded),
                                {}, context);
                            },
                            source: this
                        }),
                        context
                    );    
                });
            }
        });
    }

    checkIfCheatinResAction(card) {
        if(card.getType() !== 'action') {
            return false;
        }
        return card.abilities.actions.some(action => {
            if(action.playType && (action.playType.includes('cheatin resolution'))) {
                return true;
            }
            return false;
        });
    }
}

MurderedInTombstone.code = '20049';

module.exports = MurderedInTombstone;
