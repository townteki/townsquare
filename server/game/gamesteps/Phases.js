const SetupPhase = require('./setupphase');
const GamblingPhase = require('./gamblingphase');
const UpkeepPhase = require('./upkeepphase');
const HighNoonPhase = require('./highnoonphase');
const SundownPhase = require('./sundownphase');

class Phases {
    constructor() {
        this.nameToStepIndex = {
            setup: SetupPhase,
            gambling: GamblingPhase,
            upkeep: UpkeepPhase,
            highnoon: HighNoonPhase,
            sundown: SundownPhase
        };
    }

    names() {
        return [
            'gambling',
            'upkeep',
            'highnoon',
            'sundown'
        ];
    }

    createStep(name, game) {
        let stepClass = this.nameToStepIndex[name];

        return new stepClass(game);
    }
}

module.exports = new Phases();
