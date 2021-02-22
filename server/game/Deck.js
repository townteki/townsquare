const cards = require('./cards');
const DrawCard = require('./drawcard.js');
const DudeCard = require('./dudecard');
const DeedCard = require('./deedcard');
const GoodsCard = require('./goodscard');
const SpellCard = require('./spellcard.js');
const ActionCard = require('./actioncard.js');
const OutfitCard = require('./outfitcard');
const JokerCard = require('./jokercard');

class Deck {
    constructor(data) {
        this.data = data;
    }

    createOutfitCard(player) {
        let cardData = { type: 'outfit' };
        if(this.data.outfit) {
            cardData = {
                code: this.data.outfit.code,
                type_code: 'outfit',
                gang_code: this.data.outfit.gang_code,
                title: this.data.outfit.title,
                wealth: this.data.outfit.wealth,
                production: this.data.outfit.production
            };
        }

        let cardClass = cards[cardData.code] || OutfitCard;

        return new cardClass(player, cardData);
    }

    createLegendCard() {
        // TODO M2 Legend card not created

        return;
    }

    isDrawCard(cardData) {
        return ['goods', 'spell', 'dude', 'deed', 'action', 'joker'].includes(cardData.type_code);
    }

    prepare(player) {
        let result = {
            drawCards: []
        };

        result.starting = 0;

        this.eachRepeatedCard(this.data.drawCards || [], cardData => {
            if(this.isDrawCard(cardData)) {
                var drawCard = this.createCardForType(DrawCard, player, cardData);
                drawCard.location = 'draw deck';

                if(!drawCard.starting) {
                    result.drawCards.push(drawCard);
                } else {
                    result.starting++;
                    result.drawCards.unshift(drawCard);
                }                
            }
        });

        result.outfit = this.createOutfitCard(player);
        result.outfit.moveTo('outfit');

        result.allCards = [result.outfit].concat(result.drawCards);

        result.legend = this.createLegendCard(player);
        if(result.legend) {
            result.legend.moveTo('legend');
            result.allCards.push(result.legend);
        }

        return result;
    }

    eachRepeatedCard(cards, func) {
        for(let cardEntry of cards) {
            let starting = cardEntry.starting;
            for(var i = 0; i < cardEntry.count; i++) {
                if(starting > 0) {
                    cardEntry.card.starting = true;
                    starting--;
                }                
                func(cardEntry.card);
            }
        }
    }

    createCardForType(baseClass, player, cardData) {
        let cardClass = baseClass;

        // maybe do it the same way as cards (card type js files in folder)
        if(cardData.type_code === 'dude') {
            cardClass = DudeCard;
        }
        if(cardData.type_code === 'deed') {
            cardClass = DeedCard;
        }
        if(cardData.type_code === 'goods') {
            cardClass = GoodsCard;
        }
        if(cardData.type_code === 'spell') {
            cardClass = SpellCard;
        }
        if(cardData.type_code === 'action') {
            cardClass = ActionCard;
        }
        if(cardData.type_code === 'joker') {
            cardClass = JokerCard;
        }

        cardClass = cards[cardData.code] || cardClass;

        return new cardClass(player, cardData);
    }

    createCard(player, cardData) {
        if(this.isDrawCard(cardData)) {
            var drawCard = this.createCardForType(DrawCard, player, cardData);
            drawCard.moveTo('draw deck');
            return drawCard;
        }
    }
}

module.exports = Deck;
