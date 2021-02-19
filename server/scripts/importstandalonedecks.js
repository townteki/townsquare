/*eslint no-console:0 */

const fs = require('fs');
const path = require('path');
const monk = require('monk');

const CardService = require('../services/CardService');
const DeckService = require('../services/DeckService');

class ImportStandaloneDecks {
    constructor() {
        this.db = monk('mongodb://127.0.0.1:27017/townsquare');
        this.cardService = new CardService(this.db);
        this.deckService = new DeckService(this.db);
    }

    async import() {
        try {
            this.cards = await this.cardService.getAllCards();

            for(let deck of this.loadDecks()) {
                let existingDeck = await this.deckService.getByStandaloneId(deck.id);
                if(!existingDeck) {
                    let formattedDeck = this.formatDeck(deck);
                    console.log('Importing', formattedDeck.name);
                    await this.deckService.createStandalone(formattedDeck);
                }
            }
            console.log('Done importing standalone decks');
        } catch(err) {
            console.error('Could not finish import', err);
        } finally {
            this.db.close();
        }
    }

    loadDecks() {
        let data = fs.readFileSync(path.join(__dirname, '../../townsquare-json-data/standalone-decks.json'));
        return JSON.parse(data);
    }

    formatDeck(deck) {
        let drawCards = deck.cards.filter(card => ['goods', 'spell', 'dude', 'action', 'deed'].includes(this.cards[card.code].type));
        let outfit = deck.cards.find(card => this.cards[card.code].type === 'outfit');
        let formattedDeck = {
            standaloneDeckId: deck.id,
            name: deck.name,
            outfit: outfit,
            drawCards: drawCards.map(card => ({ count: card.count, card: { code: card.code }})),
            lastUpdated: new Date(deck.releaseDate)
        };

        if(deck.legend) {
            formattedDeck.legend = { code: deck.legend };
        }

        return formattedDeck;
    }
}

let importer = new ImportStandaloneDecks();
importer.import();
