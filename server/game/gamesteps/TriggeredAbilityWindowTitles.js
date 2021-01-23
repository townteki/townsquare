const EventToTitleFunc = {
    onCardAbilityInitiated: event => `the effects of ${event.source.name}`,
    onCardEntersPlay: event => `${event.card.name} entering play`,
    onCardPowerGained: event => `${event.card.name} gaining power`,
    onCardPowerMoved: event => `power moved from ${event.source.name} to ${event.target.name}`,
    onClaimApplied: () => 'to claim effects being applied',
    onCharacterKilled: event => `${event.card.name} being killed`,
    onCharactersKilled: () => 'characters being killed',
    onPhaseEnded: event => `${event.phase} phase ending`,
    onPhaseStarted: event => `${event.phase} phase starting`,
    onRemovedFromChallenge: event => `${event.card.name} being removed from the challenge`,
    onSacrificed: event => `${event.card.name} being sacrificed`,
    onTargetsChosen: () => 'targets being chosen'
};

const AbilityTypeToWord = {
    cancelinterrupt: 'interrupt',
    interrupt: 'interrupt',
    reaction: 'reaction',
    traitreaction: 'trait reaction',
    forcedinterrupt: 'forced interrupt',
    whenrevealed: 'when revealed'
};

const AbilityWindowTitles = {
    getTitle: function(abilityType, event) {
        let abilityWord = AbilityTypeToWord[abilityType] || abilityType;
        let titleFunc = EventToTitleFunc[event.name];

        if(['traitreaction', 'forcedinterrupt', 'whenrevealed'].includes(abilityType)) {
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
