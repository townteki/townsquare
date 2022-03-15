const LegendCard = require('../../legendcard.js');

class HankKetchum extends LegendCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onPlayWindowClosed: event => this.game.shootout && this.owner.equals(this.game.shootout.leaderPlayer) &&
                    event.playWindow.name === 'shootout plays'
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShooterPicked: () => true,
                        onShootoutRoundFinished: () => true
                    },
                    match: card => card.location === 'play area' && 
                        card.getType() === 'dude' && 
                        card.controller.equals(this.owner) &&
                        card.isParticipating() && 
                        !this.isDudeWithHighestGrit(card),
                    effect: ability.effects.cannotBePickedAsShooter()
                }));
            }
        });

        this.action({
            title: 'Hank Ketchum',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.hankKetchumCondition(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not meet the condition of single dude with at least one printed influence', 
                    context.player, this),
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} Harrowed keyword until end of the shootout round', 
                    context.player, this, this.getSinglePosseDude()),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: this.getSinglePosseDude(),
                    effect: ability.effects.addKeyword('harrowed')
                }));
            }
        });
    }

    getSinglePosseDude() {
        if(!this.game.shootout) {
            return null;
        }
        const hankPosse = this.game.shootout.getPosseByPlayer(this.owner);
        if(!hankPosse) {
            return null;
        }
        const posseDudes = hankPosse.getDudes();
        if(posseDudes.length !== 1) {
            return null;
        }
        return posseDudes[0];
    }

    hankKetchumCondition() {
        const singleDude = this.getSinglePosseDude();
        return singleDude && singleDude.getPrintedStat('influence') >= 1;
    }

    isDudeWithHighestGrit(dude, context) {
        const dudePosse = this.game.shootout.getPosseByPlayer(dude.controller);
        if(!dudePosse) {
            return false;
        }
        const highestGrit = dudePosse.getDudes().reduce((highestGrit, dude) => {
            return Math.max(dude.getGrit(context), highestGrit);
        }, 0);
        return dudePosse.getDudes().filter(dude => dude.getGrit(context) === highestGrit).includes(dude);
    }
}

HankKetchum.code = '22002';

module.exports = HankKetchum;
