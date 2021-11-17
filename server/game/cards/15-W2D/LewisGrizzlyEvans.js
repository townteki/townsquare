const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LewisGrizzlyEvans extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && !this.areWeaponsInOppPosse(),
            match: this,
            effect: ability.effects.setAsStud()
        });

        this.persistentEffect({
            condition: () => this.game.shootout && 
                this.game.shootout.getPosseSize(this.controller) > 1,
            match: this,
            effect: ability.effects.addCardAction({
                title: 'Shootout: Lewis "Grizzly" Evans',
                playType: ['shootout'],
                cost: ability.costs.bootSelf(),
                target: {
                    activePromptTitle: 'Choose dude to boot',
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'opponent',
                        participating: true,
                        condition: card => card.value < this.value 
                    },
                    cardType: ['dude'],
                    gameAction: 'boot'
                },
                message: context => 
                    this.game.addMessage('{0} uses {1} to boot {2} and both of them do not contribute to draw hand bonuses ' +
                        ' unless they are alone', context.player, this, context.target),
                handler: context => {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                    this.applyAbilityEffect(context.ability, ability => ({
                        condition: () => this.game.shootout && 
                            this.game.shootout.getPosseSize(context.player) > 1,
                        match: this,
                        effect: ability.effects.doesNotProvideBulletRatings()
                    }));
                    this.applyAbilityEffect(context.ability, ability => ({
                        condition: () => this.game.shootout && 
                            this.game.shootout.getPosseSize(context.target.controller) > 1,
                        match: context.target,
                        effect: ability.effects.doesNotProvideBulletRatings()
                    }));                    
                }
            })
        });
    }

    areWeaponsInOppPosse() {
        if(!this.game.shootout) {
            return false;
        }
        const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!oppPosse) {
            return false;
        }
        return oppPosse.findInPosse(dude => dude.hasAttachmentWithKeywords(['weapon']));
    }
}

LewisGrizzlyEvans.code = '23014';

module.exports = LewisGrizzlyEvans;
