const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JonahEssexExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.outfit.gang_code === 'outlaws', 
            effect: ability.effects.reduceSelfCost('any', () => this.getNumOfHexes())
        });

        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: card => card !== this &&
                card.controller === this.controller && 
                card.getType() === 'dude' &&
                card.isParticipating() &&
                card.isWanted(),
            effect: ability.effects.modifyBullets(1)
        });

        this.action({
            title: 'Noon/Shootout: Jonah Essex (Exp.1)',
            playType: ['noon', 'shootout'],
            target: {
                activePromptTitle: 'Choose an attached card',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.parent &&
                        card.owner !== this.controller &&
                        card.gamelocation === this.gamelocation &&
                        card.cost <= this.bounty
                },
                gameAction: 'discard'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select dude to raise bounty',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.gamelocation === this.gamelocation,
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.addBounty({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to raise bounty on {2} by 1', player, this, card);
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }

    getNumOfHexes() {
        const arrayDiffHexes = [];
        this.controller.cardsInPlay.forEach(card => {
            if(card.hasKeyword('hex') && !arrayDiffHexes.some(hex => hex.code === card.code)) {
                arrayDiffHexes.push(card);
            } 
        });
        return arrayDiffHexes.length;
    }
}

JonahEssexExp1.code = '22027';

module.exports = JonahEssexExp1;
