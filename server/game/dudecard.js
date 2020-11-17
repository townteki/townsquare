const _ = require('underscore');

const DrawCard = require('./drawcard.js');
const TradingPrompt = require('./gamesteps/tradingprompt.js');

class DudeCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.maxWeapons = 1;
        this.maxHorses = 1;
        this.maxAttires = 1;
    }

    setupCardAbilities(ability) {
        this.action({
            title: 'Call Out',
            condition: () => this.game.currentPhase === 'high noon',
            target: {
                activePromptTitle: 'Select dude to call out',
                cardCondition: card => card.getType() === 'dude' && 
                    card.gamelocation === this.gamelocation &&
                    card.uuid !== this.uuid
            },
            targetController: 'opponent',
            handler: context => {
                //this.game.killCharacter(context.target);
                this.game.addMessage('{0} uses {1} to call out {2}', context.player, this.title, context.target.title);
            },
            player: this.owner
        });

        this.action({
            title: 'Trade',
            condition: () => this.game.currentPhase === 'high noon' && this.hasAttachment(true),
            target: {
                activePromptTitle: 'Select attachment(s) to trade',
                multiSelect: true,
                numCards: 0,
                cardCondition: card => card.getType() === 'goods' && 
                    card.parent == this &&
                    !card.wasTraded()
            },
            targetController: 'current',
            handler: context => {
                this.game.queueStep(new TradingPrompt(this.game, context.player, context.target));
            },
            player: this.owner
        });        
    }

    canAttachWeapon(weapon) {
        let weapons = this.getAttachmentsByKeywords([ 'weapon' ]);
        if (weapons && weapons.length >= this.maxWeapons) {
            return false;
        }
        return true;
    }

    canAttachHorse(horse) {
        let horses = this.getAttachmentsByKeywords([ 'horse' ]);
        if (horses && horses.length >= this.maxHorses) {
            return false;
        }
        return true;
    }

    canAtachAttire(attire) {
        let attires = this.getAttachmentsByKeywords([ 'attire' ]);
        if (attires && attires.length >= this.maxAttires) {
            return false;
        }
        return true;
    }
}

module.exports = DudeCard;
