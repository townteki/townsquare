/*eslint no-console:0 */

const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const CardService = require('../../services/CardService.js');

class CardImport {
    constructor(db, dataSource, imageSource, imageDir, isPt) {
        this.db = db;
        this.dataSource = dataSource;
        this.imageSource = imageSource;
        this.imageDir = imageDir;
        this.cardService = new CardService(db);
        this.isPt = isPt;
    }

    async import() {
        try {
            await Promise.all([this.importCards(), this.importPacks()]);
        } catch(e) {
            console.log('Unable to fetch data', e);
        } finally {
            this.db.close();
        }
    }

    async importCards() {
        let cards;
        if(this.isPt) {
            cards = await this.dataSource.getPtCards();
        } else {
            cards = await this.dataSource.getCards();
        }

        await this.cardService.replaceCards(cards);

        console.info(cards.length + ' cards fetched');

        await this.fetchImages(cards);
    }

    fetchImages(cards) {
        mkdirp(this.imageDir);

        let i = 0;

        for(let card of cards) {
            let imagePath = path.join(this.imageDir, card.code + '.jpg');

            if(!fs.existsSync(imagePath)) {
                setTimeout(() => {
                    this.imageSource.fetchImage(card, imagePath);
                }, i++ * 200);
            }
        }

        console.log('Done downloading');
    }

    async importPacks() {
        let packs;
        if(this.isPt) {
            packs = await this.dataSource.getPtPacks();
        } else {
            packs = await this.dataSource.getPacks();
        }        

        await this.cardService.replacePacks(packs);

        console.info(packs.length + ' packs fetched');
    }
}

module.exports = CardImport;
