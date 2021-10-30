const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TwilightIsUponUs extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Twilight Is Upon Us',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude to join',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current',
                    participating: false, 
                    condition: card => card.isSkilled() 
                },
                cardType: ['dude'],
                ifAble: true,
                gameAction: 'joinPosse'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give +2 bullets to all shooters with skilled dudes in their posse', 
                    context.player, this),
            handler: context => {
                if(context.target) {
                    this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, context.target);
                    });
                }
                const eventHandler = event => {
                    const thisPosse = this.game.shootout.getPosseByPlayer(event.player);
                    if(thisPosse.getDudes(dude => dude.isSkilled()).length) {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: event.card,
                            effect: ability.effects.modifyBullets(2)
                        }));
                    }
                };
                this.game.on('onShooterPicked', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onShooterPicked', eventHandler));                
                this.game.once('onShootoutRoundFinished', () => this.game.removeListener('onShooterPicked', eventHandler));
            }
        });
    }
}

TwilightIsUponUs.code = '21055';

module.exports = TwilightIsUponUs;
