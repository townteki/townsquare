const fs = require('fs');
const path = require('path');
const moment = require('moment');

const logger = require('../log.js');

class CardService {
    constructor(db) {
        this.cards = db.get('cards');
        this.packs = db.get('packs');
        this.events = db.get('events');
    }

    replaceCards(cards) {
        return this.cards.remove({})
            .then(() => this.cards.insert(cards));
    }

    replacePacks(cards) {
        return this.packs.remove({})
            .then(() => this.packs.insert(cards));
    }

    getAllCards() {
        return this.cards.find({})
            .then(result => {
                let cards = {};

                for(let card of result) {
                    cards[card.code] = card;
                }

                return cards;
            }).catch(err => {
                logger.info(err);
            });
    }

    getAllPacks() {
        return this.packs.find({}).catch(err => {
            logger.info(err);
        });
    }

    getRestrictedList() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '../../townsquare-json-data/restricted-list.json'), (err, data) => {
                if(err) {
                    return reject(err);
                }

                const officialLists = this.convertOfficialListToNewFormat(JSON.parse(data)).sort((a, b) => {
                    // default to new versions of cards.
                    if(a.cardSet === 'original' && b.cardSet !== 'original') {
                        return 1;
                    }

                    return a.date > b.date ? -1 : 1;
                });

                this.events.find({}).then(events => {
                    resolve(officialLists.concat(events));
                }).catch(err => {
                    logger.info(`Unable to load events: ${err}`);
                    resolve(officialLists);
                });
            });
        });
    }

    convertOfficialListToNewFormat(versions) {
        const cardSets = [...new Set(versions.map(version => version.cardSet))];

        return cardSets.map(cardSet => {
            const activeVersion = this.getActiveVersion(versions, cardSet);
            const defaultFormat = activeVersion.formats.find(format => format.name === 'default');
            return {
                _id: `${activeVersion.issuer}-${activeVersion.version}`.replace(' ', '-').toLowerCase(),
                name: `${activeVersion.issuer} FAQ v${activeVersion.version}`,
                date: activeVersion.date,
                issuer: activeVersion.issuer,
                cardSet: activeVersion.cardSet,
                version: activeVersion.version,
                restricted: defaultFormat.restricted,
                restrictedFrom: defaultFormat.restrictedFrom,
                restrictedUpTo: defaultFormat.restrictedUpTo,
                banned: activeVersion.bannedCards,
                isPt: activeVersion.code.startsWith('pt.'),
                official: true
            };
        });
    }

    getActiveVersion(versions, cardSet) {
        const now = moment();
        const versionsForCardset = versions.filter(version => version.cardSet === cardSet);
        return versionsForCardset.reduce((max, list) => {
            let effectiveDate = moment(list.date, 'YYYY-MM-DD');
            if(effectiveDate <= now && effectiveDate > moment(max.date, 'YYYY-MM-DD')) {
                return list;
            }

            return max;
        });
    }
}

module.exports = CardService;

