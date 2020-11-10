const PublicLocations = new Set(['dead pile', 'discard pile', 'out of game', 'play area']);
const DiscardCard = require('../GameActions/DiscardCard');

class DropCommand {
    constructor(game, player, card, targetLocation, gameLocation) {
        this.game = game;
        this.player = player;
        this.card = card;
        this.originalLocation = card.location;
        this.targetLocation = targetLocation;
        this.gameLocation = gameLocation;
    }

    execute() {
        if(this.card.controller !== this.player) {
            return;
        }

        if(this.originalLocation == this.targetLocation) {
            if(this.card.getType() === 'dude' && this.targetLocation === 'play area') {
                this.player.moveDude(this.card, this.gameLocation);
            }
            return;
        }

        if(!this.isValidDropCombination()) {
            return;
        }

        if(this.originalLocation !== 'play area' && this.targetLocation === 'play area') {
            this.player.putIntoPlay(this.card, 'play', { force: true }, this.gameLocation);
        } else if(this.targetLocation === 'dead pile' && this.originalLocation === 'play area') {
            this.game.killCharacter(this.card, { allowSave: false, force: true });
        } else if(this.targetLocation === 'discard pile' && DiscardCard.allow({ card: this.card, force: true })) {
            this.player.discardCard(this.card, false, { force: true });
        } else {
            this.player.moveCard(this.card, this.targetLocation);
        }

        this.addGameMessage();
    }

    isValidLocation() {
        if (this.card.getType() === 'dude') {

        } else {
            return this.originalLocation !== this.targetLocation;
        }
    }

    isValidDropCombination() {
        const DrawDeckCardTypes = ['goods', 'dude', 'action', 'deed', 'spell', 'joker'];
        const AllowedTypesForPile = {
            'being played': ['event'],
            'dead pile': ['character'],
            'discard pile': DrawDeckCardTypes,
            'draw deck': DrawDeckCardTypes,
            'hand': DrawDeckCardTypes,
            'out of game': DrawDeckCardTypes,
            'play area': ['goods', 'spell', 'dude', 'deed']
        };

        let allowedTypes = AllowedTypesForPile[this.targetLocation];

        if(!allowedTypes) {
            return false;
        }

        return allowedTypes.includes(this.card.getType());
    }

    addGameMessage() {
        let movedCard = this.isPublicMove() ? this.card : 'a card';
        this.game.addAlert('danger', '{0} has moved {1} from their {2} to their {3}',
            this.player, movedCard, this.originalLocation, this.targetLocation);
    }

    isPublicMove() {
        return this.game.currentPhase !== 'setup' && (PublicLocations.has(this.originalLocation) || PublicLocations.has(this.targetLocation));
    }
}

module.exports = DropCommand;
