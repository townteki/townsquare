const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');

class DrGregoryTremane extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.getFaction() === Factions.Entrepreneurs, 
            effect: ability.effects.reduceSelfCost('any', () => 
                this.controller.cardsInPlay.filter(card => card.isGadget()).length)
        });

        this.action({
            title: 'Shootout: Dr. Gregory Tremane',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.controller === this.controller &&
                    card.isGadget() &&
                    card.isParticipating()
            ),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: card => !card.hasAttachment(att => att.isGadget()) 
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to send {3} home booted', 
                    context.player, this, context.costs.boot, context.target),
            handler: context => {
                this.game.shootout.sendHome(context.target, context);
            }
        });
    }
}

DrGregoryTremane.code = '21030';

module.exports = DrGregoryTremane;
