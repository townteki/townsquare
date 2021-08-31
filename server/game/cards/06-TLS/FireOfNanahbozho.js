const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class FireOfNanahbozho extends SpellCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction({ type: 'deed'});
        this.whileAttached({
            effect: ability.effects.addKeyword('holy ground')
        });
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.location === 'play area' && 
                card.getType() === 'dude' &&
                card.gamelocation === this.gamelocation && 
                card.hasKeyword('shaman'),
            effect: ability.effects.modifySkillRating('shaman', 2)
        });
        this.spellAction({
            title: 'Fire of Nanahbozho',
            playType: ['noon', 'shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { location: 'play area', controller: 'current', condition: card => card.gamelocation === this.gamelocation },
                cardType: ['dude'],
                gameAction: 'unboot'
            },
            difficulty: 10,
            message: context => this.game.addMessage('{0} uses {1} to unboot {2} and make another play', context.player, this, context.target),
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Make another play',
                        buttons: [
                            { text: 'Done', method: 'done' }
                        ],
                        promptTitle: this.title
                    },
                    source: this
                });
            },
            source: this
        });
    }

    done() {
        return true;
    }
}

FireOfNanahbozho.code = '10033';

module.exports = FireOfNanahbozho;
