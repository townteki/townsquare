const DudeCard = require('../../dudecard.js');

class Taiyari extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Taiyari',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true 
                },
                cardType: ['dude']
            },
            handler: context => {
                const amountToPay = context.target.bullets || 1;
                if(context.player.getSpendableGhostRock() >= amountToPay) {
                    this.game.transferGhostRock({
                        from: context.player,
                        to: context.player.getOpponent(),
                        amount: amountToPay
                    });
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: [
                            ability.effects.setAsStud(),
                            ability.effects.setMaxBullets(4)
                        ]
                    }));
                    this.game.addMessage('{0} uses {1} and pays {2} GR to make {3} a stud', 
                        context.player, this, amountToPay, context.target);
                } else {
                    this.game.addMessage('{0} uses {1} but does not have {2} GR to pay for {3}\'s bullet rating', 
                        context.player, this, amountToPay, context.target);
                }
            }
        });
    }
}

Taiyari.code = '20008';

module.exports = Taiyari;
