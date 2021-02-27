const PublicLocations = new Set(['dead pile', 'discard pile', 'out of game', 'play area']);
const GameActions = require('../GameActions');
const DiscardCard = require('../GameActions/DiscardCard');
const ChooseYesNoPrompt = require('../gamesteps/ChooseYesNoPrompt');
const StandardActions = require('../PlayActions/StandardActions');

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

        if(this.originalLocation === this.targetLocation) {
            if(this.card.getType() === 'dude' && this.targetLocation === 'play area') {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: this.card, 
                    targetUuid: this.gameLocation, 
                    options: { isCardEffect: false } 
                }));
            }
            return;
        }

        if(!this.isValidDropCombination()) {
            return;
        }

        if(this.originalLocation !== 'play area' && this.targetLocation === 'play area') {
            if(this.originalLocation === 'hand' && this.game.currentPhase !== 'setup') {
                this.game.queueStep(new ChooseYesNoPrompt(this.game, this.player, {
                    title: 'Are you perfoming Shoppin\' play?',
                    onYes: () => {
                        this.game.resolveStandardAbility(StandardActions.shoppin(this.gameLocation), this.player, this.card);
                    },
                    onNo: () => this.game.resolveGameAction(GameActions.putIntoPlay({ 
                        player: this.player,
                        card: this.card, 
                        params: { target: this.gameLocation }
                    }))
                }));
            } else {
                this.game.resolveGameAction(GameActions.putIntoPlay({ 
                    player: this.player,
                    card: this.card, 
                    params: { playingType: 'setup', target: this.gameLocation, force: true }
                }));
            }
        } else if(this.targetLocation === 'dead pile' && this.originalLocation === 'play area') {
            this.player.aceCard(this.card, { allowSave: false, force: true });
        } else if(this.targetLocation === 'discard pile' && DiscardCard.allow({ card: this.card, force: true })) {
            this.player.discardCard(this.card, false, { force: true });
        } else {
            this.player.moveCard(this.card, this.targetLocation);
        }

        if(this.game.currentPhase !== 'setup') {
            this.addGameMessage();
        }
    }

    isValidDropCombination() {
        const DrawDeckCardTypes = ['goods', 'dude', 'action', 'deed', 'spell', 'joker'];
        const AllowedTypesForPile = {
            'being played': ['action'],
            'dead pile': DrawDeckCardTypes,
            'discard pile': DrawDeckCardTypes,
            'draw deck': DrawDeckCardTypes,
            'hand': DrawDeckCardTypes,
            'draw hand': DrawDeckCardTypes,
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
