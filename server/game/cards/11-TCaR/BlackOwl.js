const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BlackOwl extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Black Owl',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyValue(5)
                }));
                if(!this.booted) {
                    this.game.promptForYesNo(context.player, {
                        title: 'Do you want to boot to select first casualty?',
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.bootCard({ card: this }), context).thenExecute(() => {
                                this.untilEndOfShootoutRound(context.ability, ability => ({
                                    match: context.target,
                                    effect: ability.effects.selectAsFirstCasualty()
                                }));   
                            });
                            this.game.addMessage('{0} uses {1} and boots him to give {2} +5 value and they have to be selected as first casualty', 
                                player, this, context.target);
                        },
                        onNo: player => {
                            this.game.addMessage('{0} uses {1} to give {2} +5 value', 
                                player, this, context.target);
                        },
                        source: this
                    });
                } else {
                    this.game.addMessage('{0} uses {1} to give {2} +5 value', context.player, this, context.target);
                }
            }
        });
    }
}

BlackOwl.code = '19008';

module.exports = BlackOwl;
