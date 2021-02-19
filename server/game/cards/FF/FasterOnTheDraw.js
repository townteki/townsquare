const ActionCard = require('../../actioncard.js');

class FasterOnTheDraw extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Faster on the Draw',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select your dude who will be faster on the draw',
                cardCondition: { location: 'play area', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(1)
                }));
                let deputyBonus = '';
                if(context.target.hasKeyword('deputy')) {
                    deputyBonus = ', makes him a stud';
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.setAsStud()
                    }));
                }
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select an opposing dude who is slower on the draw',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.isParticipating() && card.controller !== context.player,
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: card,
                            effect: ability.effects.modifyBullets(-2)
                        }));
                        this.game.addMessage('{0} uses {1} to give {2} +1 bullets {3} and to give {4} -2 bullets.', 
                            context.player, this, context.target, deputyBonus, card);                     
                        return true;
                    }
                });
            }
        });
    }
}

FasterOnTheDraw.code = '05037';

module.exports = FasterOnTheDraw;
