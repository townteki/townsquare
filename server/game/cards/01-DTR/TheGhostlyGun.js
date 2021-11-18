const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheGhostlyGun extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Resolution: The Ghostly Gun',
            playType: ['resolution'],
            handler: context => {
                context.player.moveCardWithContext(this, 'draw hand', context);
                this.abilityContext = context;
                this.game.promptForValue(context.player, `Set value of ${this.title} to`, 'chooseValue', this, this);
            }
        });
    }

    chooseValue(player, arg) {
        let context = this.abilityContext;
        this.untilEndOfShootoutRound(context.ability, ability => ({
            match: this,
            effect: ability.effects.setValue(arg, this.uuid)
        }), 'draw hand');
        this.game.promptForSuit(player, `Set suit of ${this.title} to`, 'chooseSuit', this, this);
        return true;
    }

    chooseSuit(player, arg) {
        let context = this.abilityContext;
        this.untilEndOfShootoutRound(context.ability, ability => ({
            match: this,
            effect: ability.effects.setSuit(arg, this.uuid)
        }), 'draw hand');
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to discard',
            cardCondition: { location: 'draw hand', controller: 'current' },
            onSelect: (player, card) => {
                this.game.resolveGameAction(GameActions.discardCard({ card }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to put him into their draw hand, set his value to {2} and suit to {3} and discards {4}', 
                        player, this, this.value, this.suit, card);
                    if(card !== this) {
                        player.determineHandResult('\'s hand has been changed to');
                    }
                });
                return true;
            },
            onCancel: player => {
                if(player.drawHand.length > 5) {
                    return false;
                }
                return true;
            },
            context,
            source: this
        });
        return true;
    }    
}

TheGhostlyGun.code = '01009';

module.exports = TheGhostlyGun;
