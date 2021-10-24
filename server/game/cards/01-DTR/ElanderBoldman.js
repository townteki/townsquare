const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ElanderBoldman extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Elander Boldman',
            playType: ['shootout'],
            cost: ability.costs.pull(),
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    participating: true, 
                    condition: card => card.hasAttachmentWithKeywords(['Gadget', 'Weapon']) 
                },
                cardType: ['dude']
            },
            message: context => {
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    this.game.addMessage('{0} uses {1} to pull {2} and discards {3} because pulled card is a club', 
                        context.player, this, context.pull.pulledCard, context.target);
                } else {
                    this.game.addMessage('{0} uses {1} to pull {2} and gives {3}\'s Weapon Gadget +3 bullets ', 
                        context.player, this, context.pull.pulledCard, context.target);
                }
            },
            handler: context => {
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                } else {
                    let weapons = context.target.getAttachmentsByKeywords(['Gadget', 'Weapon']);
                    if(weapons.length > 1) {
                        this.context = context;
                        let buttons = weapons.map(weapon => {
                            return {
                                text: weapon.title, method: 'giveBullets', arg: weapon.uuid
                            };
                        });
                        this.game.promptWithMenu(context.player, this, {
                            activePrompt: {
                                menuTitle: 'Choose weapon to boost',
                                buttons: buttons
                            },
                            source: this
                        });
                    } else {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: weapons[0],
                            effect: [
                                ability.effects.modifyBullets(3)
                            ]
                        }));                        
                    }
                }
            }
        });
    }

    giveBullets(player, arg) {
        let weapon = this.context.target.getAttachmentsByKeywords(['Gadget', 'Weapon']).filter(weapon => weapon.uuid === arg);
        this.applyAbilityEffect(this.context.ability, ability => ({
            match: weapon,
            effect: [
                ability.effects.modifyBullets(3)
            ]
        }));
    }
}

ElanderBoldman.code = '01027';

module.exports = ElanderBoldman;
