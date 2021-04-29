const GameActions = require('../../GameActions/index.js');
const NullEvent = require('../../NullEvent.js');
const OutfitCard = require('../../outfitcard.js');

class HouseOfManyFaiths extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'House of Many Faiths',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            targets: {
                blessedDude: {
                    activePromptTitle: 'Choose a dude',
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'current', 
                        condition: card => card.hasAttachmentWithKeywords('miracle') 
                    },
                    cardType: ['dude']
                },
                handCard: {
                    activePromptTitle: 'Choose a card from hand',
                    cardCondition: { location: 'hand', controller: 'current' },
                    cardType: ['dude', 'deed', 'action', 'spell', 'goods', 'joker']
                },
                discardCard: {
                    activePromptTitle: 'Choose a card from discard',
                    cardCondition: { location: 'discard pile', controller: 'current' },
                    cardType: ['dude', 'deed', 'action', 'spell', 'goods', 'joker']
                }
            },
            handler: context => {
                let msgText = '{0} uses {1}';
                let shuffleText = '';
                if(context.player.hand.length > 0) {
                    context.player.shuffleCardIntoDeck(context.targets.handCard);
                    shuffleText += ', shuffles card from hand';
                }
                if(context.player.discardPile.length > 0) {
                    context.player.shuffleCardIntoDeck(context.targets.discardCard);
                    if(shuffleText !== '') {
                        shuffleText += ', ';
                    } else {
                        shuffleText += ', shuffles ';
                    }
                    shuffleText += 'card from discard';
                }
                if(shuffleText !== '') {
                    msgText += shuffleText + ' into their deck';
                }
                let otherText = '';
                if(this.gamelocation !== this.game.townsquare.uuid) {
                    const event = this.game.resolveGameAction(GameActions.moveDude({ 
                        card: context.targets.blessedDude,
                        targetUuid: this.game.townsquare.uuid
                    }), context);
                    if(!(event instanceof NullEvent)) {
                        otherText += 'moves to Town Square ';
                    }
                }
                if(this.booted) {
                    const event = this.game.resolveGameAction(GameActions.unbootCard({ card: context.targets.blessedDude }), context);
                    if(!(event instanceof NullEvent)) {
                        if(otherText !== '') {
                            otherText += 'and ';
                        }                 
                        otherText += 'unboots ';
                    }
                }
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.targets.blessedDude,
                    effect: ability.effects.modifyInfluence(1)
                }));
                msgText += ' and chooses {2} who ';
                if(otherText !== '') {
                    msgText += otherText + 'and ';
                }
                msgText += 'gets +1 influence';
                this.game.addMessage(msgText, context.player, this, context.targets.blessedDude);
            }
        });
    }
}

HouseOfManyFaiths.code = '21001';

module.exports = HouseOfManyFaiths;
