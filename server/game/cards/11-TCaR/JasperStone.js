const LegendCard = require('../../legendcard.js');

class JasperStone extends LegendCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && !this.game.shootout.shootoutLocation.isHome(this.controller),
            match: this.controller,
            effect: ability.effects.onlyShooterContributes()
        });
        this.reaction({
            title: 'Jasper Stone',
            when: {
                onPossesFormed: () => true
            },
            cost: [ability.costs.bootSelf()],
            target: {
                activePromptTitle: 'Choose opposing dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                const jaspersPosse = this.game.shootout.getPosseByPlayer(context.player);
                this.untilEndOfShootoutPhase(context.ability, ability => ({
                    condition: () => this.game.shootout && 
                        context.target.isOpposing(context.player) &&
                        jaspersPosse.getDudes(dude => !dude.isToken()).length > 0,
                    match: context.player,
                    effect: ability.effects.modifyPosseShooterBonus(2)
                }));
                this.game.addMessage('{0} uses {1} to give their shooter +2 bullets while opposing {2}', 
                    context.player, this, context.target);
                const eventHandler = () => {
                    const givePermBonuses = card => {
                        card.modifyBullets(1);
                        card.modifyControl(1);
                        this.game.addMessage('{0} gives +1 permanent bullets and +1 permanent CP to {1} thanks to {2}', 
                            context.player, card, this); 
                    };
                    if(jaspersPosse.shooter && jaspersPosse.shooter.isParticipating()) {
                        givePermBonuses(jaspersPosse.shooter);
                    } else {
                        const shooterPickHandler = event => givePermBonuses(event.card);
                        this.game.onceConditional('onShooterPicked', { condition: event => event.card.controller === context.player }, shooterPickHandler);
                        this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onShooterPicked', shooterPickHandler));
                    }
                };
                this.game.onceConditional('onCardAced', { condition: event => event.card === context.target }, eventHandler);
                this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onCardAced', eventHandler));
            }
        });
    }
}

JasperStone.code = '19003';

module.exports = JasperStone;
