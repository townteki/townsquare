const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const DiscardPrompt = require('./nightfall/discardprompt.js');
const NightfallPrompt = require('./nightfall/nightfallprompt.js');
const DiscardToHandSizePrompt = require('./nightfall/discardtohandsizeprompt');
const PhaseNames = require('../Constants/PhaseNames.js');
class NightfallPhase extends Phase {
    constructor(game) {
        super(game, PhaseNames.Nightfall);
        this.initialise([
            new DiscardPrompt(game),
            new DiscardToHandSizePrompt(game),
            new SimpleStep(game, () => this.nightfallRedraw()),
            new SimpleStep(game, () => this.game.raiseEvent('onNightfallUnbooting')),
            new SimpleStep(game, () => this.unbootCards()),
            new SimpleStep(game, () => this.game.endRound()),
            new NightfallPrompt(game)
        ]);
    }

    nightfallRedraw() {
        this.game.getPlayers().forEach(player => {
            player.redrawToHandSize(PhaseNames.Nightfall);
            this.game.raiseEvent('onAfterHandRefill', { player });
        });
    }

    unbootCards() {
        this.game.getPlayers().forEach(player => {
            player.cardsInPlay.forEach(card => {
                if(!card.options.contains('doesNotUnbootAtNightfall')) {
                    player.unbootCard(card);
                }
            });
        });
    }
}

module.exports = NightfallPhase;
