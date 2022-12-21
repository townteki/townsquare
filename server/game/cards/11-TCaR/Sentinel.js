const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Sentinel extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Sentinel',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.modifyBullets(1),
                        ability.effects.setAsStud(1),
                        ability.effects.modifySkillRating('blessed', 1)
                    ]
                }));
                this.game.addMessage('{0} uses {1} to give +1 bullet, +1 Blessed to {2} and set them as stud', 
                    context.player, this, this.parent);
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where to move',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: { 
                        location: 'play area', 
                        condition: card => card.isAdjacent(this.gamelocation) ||
                            this.game.isTownSquare(card.gamelocation)
                    },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this.parent, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);                                 
                        return true;
                    }
                });
                this.game.once('onSundownAfterVictoryCheck', () => {
                    if(this.gamelocation === this.game.townsquare.uuid) {
                        this.game.promptForYesNo(this.controller, {
                            title: 'Do you want to discard Sentinel?',
                            onYes: player => {
                                const parent = this.parent;
                                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                                    parent.modifyControl(1);
                                    this.game.addMessage('{0} discards {1} to give {2} +1 CP', 
                                        player, this, parent);
                                });
                            },
                            source: this
                        });
                    }
                });           
            },
            source: this
        });
    }
}

Sentinel.code = '19034';

module.exports = Sentinel;
