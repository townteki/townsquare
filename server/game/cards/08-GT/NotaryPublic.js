const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class NotaryPublic extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Notary Public',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Government or Public deed',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', condition: card => 
                    (card.owner === this.controller || card.controller === this.controller) &&
                    card.hasOneOfKeywords(['Government', 'Public']) &&
                    this.isSameStreet(card)
                },
                cardType: ['deed']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                if(context.target.hasKeyword('Government')) {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a dude to increase bounty',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: { location: 'play area' },
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.addBounty({ card: card }), context);
                            this.game.addMessage('{0} uses {1} to boot {2} and increase bounty on {3}.', player, this, context.target, card);
                            return true;
                        }
                    });
                }
                if(context.target.hasKeyword('Public')) {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a dude to move',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: { location: 'play area', controller: 'current' },
                        cardType: 'dude',
                        onSelect: (player, dude) => {
                            this.game.promptForLocation(player, {
                                activePromptTitle: 'Select a location',
                                waitingPromptTitle: 'Waiting for opponent to select target location.',
                                onSelect: (player, location) => {
                                    this.game.resolveGameAction(GameActions.moveDude({ 
                                        card: dude, 
                                        targetUuid: location.uuid, 
                                        options: { needToBoot: false, allowBooted: true }
                                    }), context); 
                                    this.game.addMessage('{0} uses {1} to boot {2} and move {3} to {4}.', player, this, context.target, dude, location);                                 
                                    return true;
                                }
                            });
                            return true;
                        }
                    });
                }
            }
        });
    }
}

NotaryPublic.code = '14016';

module.exports = NotaryPublic;
