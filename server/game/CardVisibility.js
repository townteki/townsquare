const OpenInformationLocations = [
    'being played',
    'dead pile',
    'discard pile',
    'out of game',
    'play area'
];

class CardVisibility {
    constructor(game) {
        this.game = game;
        this.rules = [
            (card) => this.isPublicRule(card),
            (card) => this.isSetupRule(card),
            (card, player) => this.isControllerRule(card, player),
            (card, player) => this.isSpectatorRule(card, player),
            (card, player) => this.isDrawHandRule(card, player)
        ];
    }

    isVisible(card, player) {
        return this.rules.some(rule => rule(card, player));
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    removeRule(rule) {
        this.rules = this.rules.filter(r => r !== rule);
    }

    isDrawHandRule(card, player) {
        return card.location === 'draw hand' && player.drawHandRevealed;
    }

    isPublicRule(card) {
        return !card.facedown &&
            OpenInformationLocations.includes(card.location) && 
            this.game.currentPhase !== 'setup';
    }

    isControllerRule(card, player) {
        return card.controller === player && (card.location !== 'draw deck' || player.showDeck);
    }

    isSpectatorRule(card, player) {
        return this.game.showHand &&
               player.isSpectator() &&
               ['hand'].includes(card.location);
    }

    isSetupRule(card) {
        return card.location === 'play area' && this.game.currentPhase === 'setup' && 
            (this.game.getPlayers().every(player => player.readyToStart) ||
            card.getType() === 'outfit' ||
            card.getType() === 'legend');
    }
}

module.exports = CardVisibility;
