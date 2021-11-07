const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TontonMacoute extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Tonton Macoute',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.abilityContext = context;
                this.targetWeapons = context.target.getAttachmentsByKeywords(['weapon'])
                    .filter(weapon => !weapon.booted && weapon.allowGameAction('boot', context));
                if(this.targetWeapons.length === 0) {
                    this.reduceBullets(context.player);
                } else {
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: `Choose action on ${context.target.title}`,
                            buttons: [
                                { 
                                    text: 'Give them -2 bullets', 
                                    method: 'reduceBullets',
                                    disabled: !this.abilityContext.target.allowGameAction('decreaseBullets', context)
                                },
                                { text: 'Boot their weapon', method: 'bootWeapon' }
                            ]
                        },
                        source: this
                    });
                }
            }
        });
    }

    reduceBullets(player) {
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: ability.effects.modifyBullets(-2)
        }));
        this.game.addMessage('{0} uses {1} to give {2} -2 bullets', player, this, this.abilityContext.target);
        return true;
    }

    bootWeapon(player) {
        this.abilityContext.ability.selectAnotherTarget(player, this.abilityContext, {
            activePromptTitle: 'Select a weapon to boot',
            cardCondition: card => this.targetWeapons.includes(card),
            autoSelect: true,
            gameAction: 'boot',
            onSelect: (player, card) => {
                this.game.resolveGameAction(GameActions.bootCard({ card }), this.abilityContext).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to boot {2} on {3}', player, this, card, this.abilityContext.target);
                });
                return true;
            },
            source: this
        });
        return true;
    }
}

TontonMacoute.code = '20016';

module.exports = TontonMacoute;
