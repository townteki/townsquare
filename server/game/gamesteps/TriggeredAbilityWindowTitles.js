const EventToTitleFunc = {
    onCardAbilityInitiated: event => `the effects of ${event.source.name}`,
    onCardEntersPlay: event => `${event.card.name} entering play`,
    onPhaseEnded: event => `${event.phase} phase ending`,
    onPhaseStarted: event => `${event.phase} phase starting`,
    onDudeJoinedPosse: event => `${event.card.name} joining posse`,
    onDrawHandsRevealed: () => 'draw hands being revealed',
    onTargetsChosen: () => 'targets being chosen'
};

const AbilityTypeToWord = {
    reaction: 'reaction',
    traitreaction: 'trait reaction'
};

const AbilityWindowTitles = {
    getTitle: function(abilityType, event) {
        let abilityWord = AbilityTypeToWord[abilityType] || abilityType;
        let titleFunc = EventToTitleFunc[event.name];

        if(event.name === 'onSetupFinished' && abilityType === 'reaction') {
            return 'Choose Grifter to resolve';
        }

        if(['traitreaction'].includes(abilityType)) {
            if(titleFunc) {
                return `Choose ${abilityWord} order for ${titleFunc(event)}`;
            }

            return `Choose ${abilityWord} order`;
        }

        if(titleFunc) {
            return `Any ${abilityWord}s to ${titleFunc(event)}?`;
        }

        return `Any ${abilityWord}s?`;
    }
};

module.exports = AbilityWindowTitles;
