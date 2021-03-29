/*eslint no-console:0 */

const fs = require('fs');
const path = require('path');
const monk = require('monk');

const DeckService = require('../services/DeckService');

class ImportStandaloneDecks {
    constructor() {
        this.db = monk('mongodb://127.0.0.1:27017/townsquare');
        this.deckService = new DeckService(this.db);
    }

    async import() {
        try {
            for(let deck of this.loadDecks()) {
                let existingDeck = await this.deckService.getByStandaloneId(deck.standaloneDeckId);
                if(!existingDeck) {
                    console.log('Importing Standalone deck', deck.name);
                    await this.deckService.createStandalone(deck);
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
}

let importer = new ImportStandaloneDecks();
importer.import();
