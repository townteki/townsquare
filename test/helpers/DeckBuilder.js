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
    'Circle M Ranch', 'Circle M Ranch',
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

        let jsonPacks = fs.readdirSync(directory).filter(file => file.endsWith('.json'));

        for(let file of jsonPacks) {
            let pack = require(path.join(directory, file));

            for(let card of pack.cards) {
                card.pack_code = pack.code;
                if(card.pack_code !== 'alt') {
                    cards[card.code] = card;
                }
            }
        }

        return cards;
    }

    buildDeck(properties) {
        let params = Object.assign({ addDefaultDeck: true }, properties);
        if(params.addDefaultDeck) {
            params.cardTitles = params.cardTitles.concat(DefaultDeck);
        }
        if(params.cardCodes) {
            params.cardTitles = params.cardTitles.concat(params.cardCodes);
        }
        let allCards = this.createCardCounts(params.cardTitles);
        let outfit = this.getCard(params.outfitTitle);
        let legend = params.legendTitle ? this.getCard(params.legendTitle) : null;
        let starting = 0;
        allCards.forEach(cardCount => {
            if(params.startingTitles.includes(cardCount.card.title)) {
                cardCount.starting = 1;
                starting++;
            }
        });

        return {
            outfit: outfit,
            legend: legend,
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

        return cardsByTitle[0];
    }
}

module.exports = DeckBuilder;
