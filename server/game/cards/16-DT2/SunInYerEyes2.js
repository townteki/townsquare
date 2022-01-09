const ActionCard = require('../../actioncard');

class SunInYerEyes2 extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Sun in Yer Eyes',
            playType: 'shootout',
            target: {
                activePromptTitle: 'Select a dude who has sun in their eyes',
                cardCondition: { 
                    location: 'play area', 
                    participating: true, 
                    controller: 'opponent' },
                cardType: 'dude'
            },
            handler: context => {
                this.abilityContext = context;
                const buttons = [
                    { text: 'Give -2 bullets', method: 'applySunInYerEyes', arg: 'minusBullets' },
                    { text: 'Set to Draw', method: 'applySunInYerEyes', arg: 'setAsDraw' }
                ];
                if(context.player.getSpendableGhostRock() >= 1) {
                    buttons.push({ text: 'Both effects', method: 'applySunInYerEyes', arg: 'both' });
                }
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: `Select effect(s) for ${context.target.title}`,
                        buttons
                    },
                    source: this
                });
            }
        });
    }

    applySunInYerEyes(player, arg) {
        switch(arg) {
            case 'minusBullets':
                this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                    match: this.abilityContext.target,
                    effect: ability.effects.modifyBullets(-2)
                }));
                this.game.addMessage('{0} uses {1} to give {2} -2 bullets', player, this, this.abilityContext.target);
                break;
            case 'setAsDraw':
                this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                    match: this.abilityContext.target,
                    effect: ability.effects.setAsDraw()
                }));
                this.game.addMessage('{0} uses {1} to make {2} a draw', player, this, this.abilityContext.target);
                break;
            case 'both':
                player.spendGhostRock(1);
                this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                    match: this.abilityContext.target,
                    effect: [
                        ability.effects.setAsDraw(),
                        ability.effects.modifyBullets(-2)
                    ]
                }));
                this.game.addMessage('{0} uses {1} and pays 1 GR to give {2} -2 bullets and make them a draw', 
                    player, this, this.abilityContext.target);
                break;       
            default:
                break;
        }
        return true;
    }
}

SunInYerEyes2.code = '24221';

module.exports = SunInYerEyes2;
