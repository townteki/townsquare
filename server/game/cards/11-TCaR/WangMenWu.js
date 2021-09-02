const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class WangMenWu extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Wang Men Wu',
            when: {
                onPossesFormed: () => this.game.shootout && 
                    this.game.shootout.opposingPlayer === this.controller
            },
            handler: context => {
                const gunslinger = context.player.placeToken('Gunslinger', this.gamelocation);
                this.game.resolveGameAction(GameActions.joinPosse({ card: gunslinger }), context);
                this.game.resolveGameAction(GameActions.bootCard({ card: gunslinger }), context);
                this.game.addMessage('{0} uses {1} to have {2} join their posse booted', context.player, this, gunslinger);
                const eventHandler = () => {
                    gunslinger.removeFromGame();
                };
                this.game.onceConditional('onShooterToBePicked', { 
                    condition: event => event.player === context.player 
                }, eventHandler);
                this.game.once('onShootoutPhaseFinished', () => {
                    if(gunslinger.location === 'play area') {
                        gunslinger.removeFromGame();
                    }
                    this.game.removeListener('onShooterToBePicked', eventHandler);
                });
            }
        });
    }
}

WangMenWu.code = '19005';

module.exports = WangMenWu;
