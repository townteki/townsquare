const cards = require('./cards');
const DrawCard = require('./drawcard.js');

class Deck {
    constructor(data) {
        this.data = data;
    }

    createOutfitCard(player) {
        if(this.data.outfit) {
            return new DrawCard(player, {
                code: this.data.outfit.code,
                type_code: 'outfit',
                gang_code: this.data.outfit.gang_code,
                title: this.data.outfit.title,
                wealth: this.data.outfit.wealth,
                production: this.data.outfit.production
            });
        }

        return new DrawCard(player, { type: 'outfit' });
    }

    createLegendCard(player) {
        // TODO M2 Legend card not created

        return;
    }

    isDrawCard(cardData) {
        return ['goods', 'spell', 'dude', 'deed', 'action'].includes(cardData.type_code);
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
                //drawCard.moveTo('draw deck');

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
        // do not use specific classes as we do not have them yet
        //let cardClass = cards[cardData.code] || baseClass;

        let cardClass = baseClass;
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
