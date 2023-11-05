const EventToTitleFunc = {
    onAbilityResolutionStarted: event => `the use of ${event.ability.card.title} being declared`,
    onCardAbilityInitiated: event => `the effects of ${event.source.title}`,
    onCardEntersPlay: event => `${event.card.title} entering play`,
    onPhaseEnded: event => `${event.phase} phase ending`,
    onPhaseStarted: event => `${event.phase} phase starting`,
    onDudeJoinedPosse: event => `${event.card.title} joined posse`,
    onDudeJoiningPosse: event => `${event.card.title} joining posse`,
    onDudeMoved: event => {
        const location = event.card.game.findLocation(event.target);
        const locCardTitle = location ? ` to ${location.locationCard.title}` : '';
        return `${event.card.title} moving${locCardTitle}`;
    },
    onCardBountyAdded: event => `${event.card.title} getting bounty`,
    onDrawHandsRevealed: () => 'draw hands being revealed',
    onTargetsChosen: event => `targets being chosen by ${event.ability.card.title}`
};

const AbilityTypeToWord = {
    reaction: 'reaction',
    traitreaction: 'trait reaction',
    beforereaction: 'reaction'
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
