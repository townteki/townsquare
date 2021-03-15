/*eslint no-console:0 */
const fs = require('fs');
const path = require('path');

class JsonCardSource {
    constructor(directory) {
        let data = this.loadPackFiles(directory);
        this.packs = data.packs;
        this.cards = data.cards;
    }

    loadPackFiles(directory) {
        let cards = [];
        let files = fs.readdirSync(path.join(directory, 'packs'));
        for(let file of files) {
            let pack = JSON.parse(fs.readFileSync(path.join(directory, 'packs', file)));
            if(pack.code === 'alt') {
                continue;
            }
            cards = cards.concat(pack.cards);
        }

        let packs = JSON.parse(fs.readFileSync(path.join(directory, 'dtr-packs.json')));
        return {
            cards: cards,
            packs: packs
        };
    }

    getCards() {
        return this.cards;
    }

    getPacks() {
        return this.packs;
    }
}

module.exports = JsonCardSource;
