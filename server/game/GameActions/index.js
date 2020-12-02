const AbilityAdapter = require('./AbilityAdapter');
const AceCard = require('./AceCard');
const AddToHand = require('./AddToHand');
const CancelEffects = require('./CancelEffects');
const CheckReserve = require('./CheckReserve');
const ChooseGameAction = require('./ChooseGameAction');
const DiscardCard = require('./DiscardCard');
const DiscardTopCards = require('./DiscardTopCards');
const DiscardPower = require('./DiscardPower');
const DrawCards = require('./DrawCards');
const GainGhostRock = require('./GainGhostRock');
const GainPower = require('./GainPower');
const BootCard = require('./BootCard');
const LookAtDeck = require('./LookAtDeck');
const LookAtHand = require('./LookAtHand');
const MovePower = require('./MovePower');
const PlaceToken = require('./PlaceToken');
const PutIntoPlay = require('./PutIntoPlay');
const RemoveFromGame = require('./RemoveFromGame');
const ReturnCardToHand = require('./ReturnCardToHand');
const ReturnGoldToTreasury = require('./ReturnGoldToTreasury');
const RevealCard = require('./RevealCard');
const SacrificeCard = require('./SacrificeCard');
const Search = require('./Search');
const Shuffle = require('./Shuffle');
const ShuffleIntoDeck = require('./ShuffleIntoDeck');
const SimultaneousAction = require('./SimultaneousAction');
const UnbootCard = require('./UnbootCard');
const TakeControl = require('./TakeControl');

const GameActions = {
    aceCard: props => new AbilityAdapter(AceCard, props),
    addToHand: props => new AbilityAdapter(AddToHand, props),
    cancelEffects: props => new AbilityAdapter(CancelEffects, props),
    checkReserve: props => new AbilityAdapter(CheckReserve, props),
    choose: props => new AbilityAdapter(
        new ChooseGameAction(props),
        context => context
    ),
    discardCard: props => new AbilityAdapter(DiscardCard, props),
    discardTopCards: props => new AbilityAdapter(DiscardTopCards, props),
    discardPower: props => new AbilityAdapter(DiscardPower, props),
    drawCards: props => new AbilityAdapter(DrawCards, props),
    gainGhostRock: props => new AbilityAdapter(GainGhostRock, props),
    gainPower: props => new AbilityAdapter(GainPower, props),
    bootCard: props => new AbilityAdapter(BootCard, props),
    lookAtDeck: props => new AbilityAdapter(LookAtDeck, props),
    lookAtHand: props => new AbilityAdapter(LookAtHand, props),
    movePower: props => new AbilityAdapter(MovePower, props),
    placeToken: props => new AbilityAdapter(PlaceToken, props),
    putIntoPlay: props => new AbilityAdapter(PutIntoPlay, props),
    removeFromGame: props => new AbilityAdapter(RemoveFromGame, props),
    returnCardToHand: props => new AbilityAdapter(ReturnCardToHand, props),
    returnGoldToTreasury: props => new AbilityAdapter(ReturnGoldToTreasury, props),
    revealCard: props => new AbilityAdapter(RevealCard, props),
    sacrificeCard: props => new AbilityAdapter(SacrificeCard, props),
    search: props => new AbilityAdapter(
        new Search(props),
        context => ({ context })
    ),
    shuffle: props => new AbilityAdapter(Shuffle, props),
    shuffleIntoDeck: props => new AbilityAdapter(ShuffleIntoDeck, props),
    simultaneously: function(actions) {
        return new SimultaneousAction(actions);
    },
    unbootCard: props => new AbilityAdapter(UnbootCard, props),
    takeControl: props => new AbilityAdapter(TakeControl, props)
};

module.exports = GameActions;
