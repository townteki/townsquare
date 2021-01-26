const OutfitCard = require('../../outfitcard.js');

class TheSloaneGang extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Sloane Gang',
            playType: 'noon',
            cost: ability.costs.bootSelf(),        
            target: {
                activePromptTitle: 'Select dude in Town Square',
                cardCondition: { location: 'play area', condition: card => card.getLocation().isTownSquare() },
                cardType: 'dude'
            },
            handler: context => {
                if (!this.dudesOnAMission) {
                    this.dudesOnAMission = [context.target];
                    this.game.once('onSundownAfterVictoryCheck', () => {
                        this.dudesOnAMission.forEach(dude => this.checkMission(context.player, dude));
                        this.game.once('onPhaseEnded', () => this.dudesOnAMission = null);
                    });
                } else {
                    this.dudesOnAMission.push(context.target);
                }
                this.game.addMessage('{0} uses {1} to assign mission of holding Town Square to {2}.', context.player, this, context.target);
            },
            source: this
        });
    }

    checkMission(player, dude) {
        if (dude.location !== 'play area') {
            return;
        }
        if (dude.getLocation().isTownSquare()) {
            if (dude.control <= 0) {
                this.game.promptWithMenu(player, this, {
                    activePrompt: {
                        menuTitle: 'Choose one for ' + dude.title,
                        buttons: [
                            { text: 'Gain 1 GR', method: 'gainGR', arg: dude.uuid, card: dude },
                            { text: 'Get 1 Control point', method: 'getControlPoint', arg: dude.uuid, card: dude }
                        ],
                        promptTitle: this.title
                    },
                    source: this
                });
            } else {
                this.gainGR(player);
            }            
        }
    }

    gainGR(player, dudeUuid) {
        let dude = this.dudesOnAMission.find(dude => dude.uuid === dudeUuid);
        player.modifyGhostRock(1);
        this.game.addMessage('{0} gains 1 GR because {1} held the Town Square (effect of {2})', player, dude, this);
        return true;
    }

    getControlPoint(player, dudeUuid) {
        let dude = this.dudesOnAMission.find(dude => dude.uuid === dudeUuid);
        dude.modifyControl(1);
        this.game.addMessage('{0} gains 1 Control point because {1} held the Town Square (effect of {2})', player, dude, this);
        return true;
    }
}

TheSloaneGang.code = '01004';

module.exports = TheSloaneGang;