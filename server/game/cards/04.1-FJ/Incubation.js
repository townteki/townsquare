const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Incubation extends ActionCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.parent && this.parent.getType() === 'dude',
            match: this.parent,
            effect: [
                ability.effects.modifyBullets(-1),
                ability.effects.modifyInfluence(-1),
                ability.effects.modifyValue(-3)
            ]
        });

        this.action({
            title: 'Recover from Incubation',
            playType: 'noon',
            condition: () => this.parent && this.parent.getType() === 'dude',
            cost: ability.costs.bootParent(),
            handler: context => {
                const patientName = this.parent.title;
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                    this.game.addMessage('{0} boots to discard an attached {1}', patientName, this);
                });
            }
        });

        this.action({
            title: 'Attach Incubation',
            playType: 'noon',
            condition: () => !this.parent,
            target: {
                activePromptTitle: 'Choose a booted dude at home to incubate',
                cardCondition: {
                    location: 'play area',
                    controller: 'any',
                    booted: true,
                    condition: card => card.booted &&
                        (card.gamelocation === card.owner.getOutfitCard() || card.gamelocation === card.controller.getOutfitCard())
                },
                cardType: ['dude']
            },
            handler: context => {
                context.player.attach(this, context.target, 'ability', () => {
                    this.game.addMessage('{0} uses {1} on {2}', context.player, this, context.target);
                });
            }
        });
    }
}

Incubation.code = '06020';

module.exports = Incubation;
