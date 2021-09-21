const DudeCard = require('../../dudecard.js');

class SeamusOToole extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout" Seamus O\'Toole',
            playType: ['shootout'],
            cost: ability.costs.pull(),
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    participating: true, 
                    controller: 'current',
                    condition: card => card.hasAttachmentWithKeywords(['Gadget', 'Weapon']) 
                },
                cardType: ['dude']
            },
            message: context => {
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    this.game.addMessage('{0} uses {1} to pull {2} and reduces {3} to zero draw because pulled card is a club', context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1} to pull {2} and gives {3}\'s Weapon Gadget +2 bullets ', context.player, this);
                }
            },
            handler: context => {
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: [
                            ability.effects.setBullets(0),
                            ability.effects.setAsDraw()
                        ]
                    }));                 
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
                            effect: ability.effects.modifyBullets(2)
                        }));                        
                    }
                }
            }
        });
    }

    giveBullets(arg) {
        let weapon = this.context.target.getAttachmentsByKeywords(['Gadget', 'Weapon']).filter(weapon => weapon.uuid === arg);
        this.applyAbilityEffect(this.context.ability, ability => ({
            match: weapon,
            effect: ability.effects.modifyBullets(2)
        }));
    }
}

SeamusOToole.code = '25017';

module.exports = SeamusOToole;
