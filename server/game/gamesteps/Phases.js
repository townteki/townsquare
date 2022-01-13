const SetupPhase = require('./setupphase');
const GamblingPhase = require('./gamblingphase');
const UpkeepPhase = require('./upkeepphase');
const HighNoonPhase = require('./highnoonphase');
const SundownPhase = require('./sundownphase');
const NightfallPhase = require('./nightfallphase');

class Phases {
    constructor() {
        this.nameToStepIndex = {
            setup: SetupPhase,
            gambling: GamblingPhase,
            upkeep: UpkeepPhase,
            highnoon: HighNoonPhase,
            sundown: SundownPhase,
            nightfall: NightfallPhase
        };
    }

    names() {
        return [
            'gambling',
            'upkeep',
            'highnoon',
            'sundown',
            'nightfall'
        ];
    }

    createStep(name, game) {
        let stepClass = this.nameToStepIndex[name];

        return new stepClass(game);
    }
}

module.exports = new Phases();
