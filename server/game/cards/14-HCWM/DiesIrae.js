const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DiesIrae extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout: Dies Irae',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 8,
            onSuccess: (context) => {
                this.abilityContext = context;
                this.game.onceConditional('onShooterPicked', { 
                    until: 'onShootoutPhaseFinished',
                    condition: event => event.card.controller === context.player 
                }, () => {
                    let deadDudes = context.player.deadPile.filter(card => card.getType() === 'dude');
                    if(!deadDudes.length) {
                        return;
                    }
                    if(deadDudes.length > 4) {
                        this.game.promptForSelect(context.player, {
                            activePromptTitle: 'Select 4 dudes to contribute',
                            waitingPromptTitle: 'Waiting for opponent to select 4 dead dudes',
                            cardCondition: card => deadDudes.includes(card),
                            numCards: 4,
                            multiSelect: true,
                            onSelect: (player, cards) => {
                                this.diesIraeBonus(player, cards);
                                return true;
                            },
                            source: this
                        });
                    } else {
                        this.diesIraeBonus(context.player, deadDudes);
                    }
                });
                this.untilEndOfShootoutRound(context.ability, ability => ({
                    match: context.player,
                    effect: ability.effects.dudesCannotFlee()
                }));
                this.game.addMessage('{0} uses {1} to choose 4 dudes from Boot Hill to contribute once they pick their shooter. ' +
                    'Their dudes cannot flee shootout this round', context.player, this);                                             
            },
            source: this
        });
    }

    diesIraeBonus(player, cards) {
        let studBonus = 0;
        let drawBonus = 0;
        cards.forEach(card => {
            if(card.isDraw()) {
                drawBonus += 1;
            }
            if(card.isStud()) {
                studBonus += 1;
            }
        });
        if(studBonus) {
            this.untilEndOfShootoutRound(this.abilityContext.ability, ability => ({
                match: player,
                effect: ability.effects.modifyPosseStudBonus(studBonus)
            }));
        }
        if(drawBonus) {
            this.untilEndOfShootoutRound(this.abilityContext.ability, ability => ({
                match: player,
                effect: ability.effects.modifyPosseDrawBonus(drawBonus)
            }));
        }
        this.game.addMessage('{0} gets {1} stud bonus and {2} draw bonus thanks to {3} and squad of angels: {4}', 
            this.abilityContext.player, studBonus, drawBonus, this, cards);            
    }
}

DiesIrae.code = '22047';

module.exports = DiesIrae;
