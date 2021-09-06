const LegendCard = require('../../legendcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class AndrewLane extends LegendCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout &&
                this.game.shootout.leaderPlayer === this.controller,
            match: card => card.controller === this.owner &&
                card.getType() === 'dude' &&
                card.isParticipating() &&
                !card.hasAttachmentWithKeywords(['weapon']),
            effect: ability.effects.modifyBullets(-1)
        });

        this.action({
            title: 'Shootout: Andrew Lane',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select weapon',
                cardCondition: { 
                    location: 'hand', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('weapon') &&
                        !card.isUnique()
                }
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select your dude to receive weapon',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.isParticipating() && 
                        card.controller === context.player &&
                        !card.isToken(),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playType: 'ability',
                            abilitySourceType: 'card',
                            targetParent: dude
                        }, () => {
                            this.game.addMessage('{0} uses {1} to attach {2} to {3}', player, this, context.target, dude);
                        }), player, context.target);               
                        return true;
                    },
                    source: this
                });                
            }
        });
    }
}

AndrewLane.code = '22001';

module.exports = AndrewLane;
