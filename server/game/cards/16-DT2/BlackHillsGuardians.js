const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BlackHillsGuardians extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'opponent',
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.getType() === 'dude' &&
                card.locationCard &&
                card.locationCard.hasKeyword('holy ground'),
            effect: ability.effects.cannotRefuseCallout()
        });

        this.action({
            title: 'Shootout: Black Hills Guardians',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.controller === this.owner &&
                card.hasKeyword('holy ground')
            ),
            repeatable: true,
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to join',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.gamelocation === context.costs.boot.uuid,
                    cardType: 'dude',
                    gameAction: 'joinPosse',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.joinPosse({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to move {2} into the shootout', player, this, card);
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

BlackHillsGuardians.code = '24007';

module.exports = BlackHillsGuardians;
