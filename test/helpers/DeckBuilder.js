/*eslint no-console:0 */

const fs = require('fs');
const path = require('path');

const {matchCardByNameAndPack} = require('./cardutil.js');

const PathToSubModulePacks = path.join(__dirname, '../../townsquare-json-data/packs');

const DefaultDeck = [
    'Jackson\'s Strike', 'Jackson\'s Strike', 
    'Hustings', 'Hustings',
    'Blake Ranch', 'Blake Ranch',
    'Bunkhouse', 'Bunkhouse',
    'Mustang', 'Mustang',
    'Roan', 'Roan',
    'Shotgun', 'Shotgun',
    'Buffalo Rifle', 'Buffalo Rifle',
    'Bad Company', 'Bad Company',
    'Pistol Whip', 'Pistol Whip',
    'Ambush', 'Ambush'
];

class DeckBuilder {
    constructor() {
        this.cardsByCode = this.loadCards(PathToSubModulePacks);
        this.cards = Object.values(this.cardsByCode);
    }

    loadCards(directory) {
        let cards = {};

        let jsonCards = fs.readdirSync(directory).find(file => file === 'dtr-cards.json');

        let allcards = require(path.join(directory, jsonCards));

        for(let card of allcards) {
            if(card.pack_code !== 'alt') {
                cards[card.code] = card;
            }
        }

        return cards;
    }

    buildDeck(outfitTitle, cardLabels, startingTitles, addDefaultDeck = true) {
        if(addDefaultDeck) {
            cardLabels = cardLabels.concat(DefaultDeck);
        }
        let allCards = this.createCardCounts(cardLabels);
        let outfit = this.getCard(outfitTitle);
        let starting = 0;
        allCards.forEach(cardCount => {
            if(startingTitles.includes(cardCount.card.title)) {
                cardCount.card.starting = true;
                starting++;
            }
        });

        return {
            outfit: outfit,
            legend: null,
            drawCards: allCards.filter(cardCount => ['dude', 'deed', 'goods', 'spell', 'action'].includes(cardCount.card.type_code)),
            starting: starting
        };
    }

    createCardCounts(cardLabels) {
        let cardCounts = {};
        for(let label of cardLabels) {
            let cardTitle = label;
            let count = 1;
            if(typeof label !== 'string') {
                cardTitle = label.name;
                count = label.count;
            }

            let cardData = this.getCard(cardTitle);
            if(cardCounts[cardData.code]) {
                cardCounts[cardData.code].count += count;
            } else {
                cardCounts[cardData.code] = {
                    count: count,
                    card: cardData
                };
            }
        }
        return Object.values(cardCounts);
    }

    getCard(codeOrLabelOrName) {
        if(this.cardsByCode[codeOrLabelOrName]) {
            return this.cardsByCode[codeOrLabelOrName];
        }

        let cardsByTitle = this.cards.filter(matchCardByNameAndPack(codeOrLabelOrName));

        if(cardsByTitle.length === 0) {
            throw new Error(`Unable to find any card matching ${codeOrLabelOrName}`);
        }

        if(cardsByTitle.length > 1) {
            cardsByTitle.sort((a, b) => a.releaseDate < b.releaseDate ? -1 : 1);
            let matchingLabels = cardsByTitle.map(card => `${card.title} (${card.pack_code})`).join('\n');
            console.warn(`Multiple cards match the name ${codeOrLabelOrName}. Use one of these instead:\n${matchingLabels}`);
        }

        return cardsByTitle[0];
    }
}

module.exports = DeckBuilder;
