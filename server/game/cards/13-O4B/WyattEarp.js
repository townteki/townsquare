const { ShootoutStatuses } = require('../../Constants/index.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WyattEarp extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.outfit.gang_code === 'lawdogs', 
            effect: ability.effects.reduceSelfCost('any', 
                () => this.controller.deadPile.reduce((agg, card) => card.getType() === 'dude' ? agg + 1 : agg, 0) * 2)
        });

        this.persistentEffect({
            condition: () => this.isParticipating() && this.oppShooterCondition(),
            match: this.controller,
            effect: ability.effects.modifyPosseShooterBonus(2)
        });

        this.action({
            title: 'Cheatin\' Resolution: Wyatt Earp',
            playType: ['cheatin resolution'],
            target: {
                activePromptTitle: 'Choose a dude to ace',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: card => card.shootoutStatus === ShootoutStatuses.MarkShooter ||
                        card.shootoutStatus === ShootoutStatuses.LeaderShooter ||
                        card.isWanted()
                },
                cardType: ['dude'],
                gameAction: 'ace'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to ace {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context);
            }
        });
    }

    oppShooterCondition() {
        if(!this.game.shootout) {
            return false;
        }
        const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!oppPosse) {
            return false;
        }
        return oppPosse.shooter && oppPosse.shooter.bounty > oppPosse.shooter.bullets;
    }
}

WyattEarp.code = '21026';

module.exports = WyattEarp;
