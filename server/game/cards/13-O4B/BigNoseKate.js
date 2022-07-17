const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const JobAction = require('../../jobaction.js');

class BigNoseKate extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Big Nose Kate',
            playType: ['noon'],
            cost: ability.costs.discardFromHand(),
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.gamelocation === this.gamelocation
                },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(1)
                }));
                let msg = '{0} uses {1} and discards {2} to give {3} +1 bullets';
                if(this.checkIfJobOrShootoutAction(context.costs.discardFromHand)) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.modifyInfluence(1)
                    }));
                    msg += ' and +1 influence';
                }
                if(!context.target.isWanted()) {
                    this.game.promptForYesNo(context.player, {
                        title: 'Do you want to add a bounty to ' + context.target.title + '?',
                        onYes: () => {
                            this.game.resolveGameAction(GameActions.addBounty({ card: context.target }), context);
                            msg += ' and 1 bounty';
                        },
                        source: this
                    });
                }
                this.game.addMessage(msg, context.player, this, context.costs.discardFromHand, context.target);
            }
        });
    }

    checkIfJobOrShootoutAction(card) {
        if(card.getType() !== 'action') {
            return false;
        }
        return card.abilities.actions.some(action => {
            if(action instanceof JobAction) {
                return true;
            }
            if(action.playType && (action.playType.includes('shootout') || action.playType.includes('shootout:join'))) {
                return true;
            }
            return false;
        });
    }
}

BigNoseKate.code = '21031';

module.exports = BigNoseKate;
