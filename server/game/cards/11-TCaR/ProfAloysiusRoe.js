const DudeCard = require('../../dudecard.js');

class ProfAloysiusRoe extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.addKeyword('gadget'),
                ability.effects.cannotInventGadgets()
            ]
        });

        this.reaction({
            title: 'Prof. Aloysius Roe',
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.pullingDude && event.props.source &&
                    event.props.pullingDude.gamelocation === this.gamelocation &&
                    event.props.source.hasKeyword('gadget')
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to increase the {2}\'s pull by {3}', 
                    context.player, this, context.event.props.pullingDude, this.getSkillRating('mad scientist')),
            handler: context => {
                const saveEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    if(event.value) {
                        event.value += this.getSkillRating('mad scientist');
                    } else {
                        event.value = this.getSkillRating('mad scientist');
                    }
                    saveEventHandler(event);
                });
            }
        });
    }
}

ProfAloysiusRoe.code = '19014';

module.exports = ProfAloysiusRoe;
