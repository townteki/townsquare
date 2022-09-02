const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions/index.js');

class ThirstForBlood extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Thirst for Blood',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true,
                    condition: card => card.influence > 0
                },
                cardType: ['dude'],
                gameAction: { or: ['setAsStud', 'increaseBullets', 'addBounty'] }
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: `Choose effect for ${context.target.title}`,
                        buttons: [
                            { 
                                text: 'Make them a stud', 
                                method: 'applyTfBEffects',
                                arg: 'makeStud',
                                disabled: !this.abilityContext.target.allowGameAction('setAsStud', this.abilityContext)
                            },
                            { 
                                text: 'Give them +2 bullets', 
                                method: 'applyTfBEffects',
                                arg: 'giveBullets',
                                disabled: !this.abilityContext.target.allowGameAction('increaseBullets', this.abilityContext)
                            },
                            { 
                                text: 'Increase bounty to gain both', 
                                method: 'applyTfBEffects',
                                arg: 'gainBoth',
                                disabled: !this.abilityContext.target.allowGameAction('addBounty', this.abilityContext)
                            }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    applyTfBEffects(player, arg) {
        switch(arg) {
            case 'makeStud':
                this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                    match: this.abilityContext.target,
                    effect: ability.effects.setAsStud()
                })); 
                this.game.addMessage('{0} uses {1} to make {2} a stud', 
                    player, this, this.abilityContext.target);
                break;
            case 'giveBullets':
                this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                    match: this.abilityContext.target,
                    effect: ability.effects.modifyBullets(2)
                }));
                this.game.addMessage('{0} uses {1} to give {2} +2 bullets', 
                    player, this, this.abilityContext.target);
                break;
            case 'gainBoth':
                this.game.resolveGameAction(GameActions.addBounty({ 
                    card: this.abilityContext.target
                }), this.abilityContext);
                this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                    match: this.abilityContext.target,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.modifyBullets(2)
                    ]
                })); 
                this.game.addMessage('{0} uses {1} and raises {2}\'s bounty to give them 2 bullets and make them a stud', 
                    player, this, this.abilityContext.target);
                break;
            default:
                break;
        }
        this.untilEndOfPhase(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: ability.effects.modifyInfluence(-1)
        }), PhaseNames.Sundown);
        this.game.addMessage('{0} reduces {1}\'s influence by 1 due to their {2}', 
            player, this.abilityContext.target, this);

        return true;
    }
}

ThirstForBlood.code = '24254';

module.exports = ThirstForBlood;
