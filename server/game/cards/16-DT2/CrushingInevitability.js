const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class CrushingInevitability extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.techniqueAction({
            title: 'Shootout: Crushing Inevitability',
            playType: ['shootout'],
            cost: ability.costs.bootKfDude(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            onSuccess: (context) => {
                if(context.target.booted) {
                    this.untilEndOfShootoutRound(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.doesNotProvideBulletRatings()
                    }));
                    this.game.addMessage('{0} uses {1} to prevent {2} from contributing to draw hands this round', 
                        context.player, this, context.target);
                }
                if(context.target.value < context.kfDude.value) {
                    this.untilEndOfShootoutRound(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.selectAsFirstCasualty()
                    }));
                    this.game.addMessage('{0} uses {1} to force {2} to be selected as first casualty this round', 
                        context.player, this, context.target);
                }
            },
            source: this
        });
    }
}

CrushingInevitability.code = '24245';

module.exports = CrushingInevitability;
