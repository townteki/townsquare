/* global describe, beforeEach, jasmine */
/* eslint no-invalid-this: 0 */

require('./objectformatters.js');

const DeckBuilder = require('./DeckBuilder');
const GameFlowWrapper = require('./gameflowwrapper.js');

const ProxiedGameFlowWrapperMethods = [
    'startGame', 'keepStartingPosse', 'skipGrifterPrompt', 'selectFirstPlayer',
    'completeHighNoonPhase', 'doneHighNoonPhase', 'completeGamblingPhase',
    'completeUpkeepPhase', 'completeShootoutPlaysStep', 'doneShootoutPlaysStep', 
    'completeShootoutResolutionStep', 'doneShootoutResolutionStep', 'drawStartingPosse',
    'skipToHighNoonPhase', 'removeFromPosse', 'discardDrawHand', 'completeShootoutDrawStep',
    'eachPlayerInShootoutLoseWinOrder', 'completeTakeYerLumpsStep'
];

const deckBuilder = new DeckBuilder();

function serializeButtons(buttons) {
    return buttons.map(button => {
        let text = button.disabled ? button.text + ' (Disabled)' : button.text;
        return `[${text}]`;
    }).join('\n');
}

var customMatchers = {
    toHavePrompt: function(util, customEqualityMatchers) {
        return {
            compare: function(actual, expected) {
                var currentTitle = actual.currentPrompt().menuTitle;
                var result = {};

                result.pass = util.equals(currentTitle, expected, customEqualityMatchers);

                if(result.pass) {
                    result.message = `Expected ${actual.name} not to have prompt "${expected}" but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have prompt "${expected}" but it had "${currentTitle}".`;
                }

                return result;
            }
        };
    },
    toHavePromptButton: function(util, customEqualityMatchers) {
        return {
            compare: function(actual, expected) {
                let buttons = actual.currentPrompt().buttons;
                let buttonWithText = buttons.find(button => util.equals(button.text, expected, customEqualityMatchers));
                let result = {};

                result.pass = buttonWithText && !buttonWithText.disabled;

                if(result.pass) {
                    result.message = `Expected ${actual.name} not to have prompt button "${expected}" but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have prompt button "${expected}" but it had buttons:\n${serializeButtons(buttons)}`;
                }

                return result;
            }
        };
    },
    toHaveDisabledPromptButton: function(util, customEqualityMatchers) {
        return {
            compare: function(actual, expected) {
                let buttons = actual.currentPrompt().buttons;
                let buttonWithText = buttons.find(button => util.equals(button.text, expected, customEqualityMatchers));
                let result = {};

                result.pass = buttonWithText && buttonWithText.disabled;

                if(result.pass) {
                    result.message = `Expected ${actual.name} not to have disabled prompt button "${expected}" but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have disabled prompt button "${expected}" but it had buttons:\n${serializeButtons(buttons)}`;
                }

                return result;
            }
        };
    },
    toBeControlledBy: function(util, customEqualityMatchers) {
        return {
            compare: function(actual, expected) {
                let result = {};
                let controller = actual.controller;

                result.pass = util.equals(controller.name, expected.name, customEqualityMatchers);

                if(result.pass) {
                    result.message = `Expected ${actual.name} not to be controlled by ${expected.name} but it is.`;
                } else {
                    result.message = `Expected ${actual.name} to be controlled by ${expected.name} but is controlled by ${controller.name}`;
                }

                return result;
            }
        };
    },
    toAllowAbilityTrigger: function(util, customEqualityMatchers) {
        return {
            compare: function(actual, expected) {
                let result = {};
                if(typeof expected !== 'string') {
                    expected = expected.name;
                }

                let selectableCardNames = actual.player.getSelectableCards().map(card => card.title);
                let isPromptingAbility = actual.game.hasOpenReactionWindow();
                let includesCard = selectableCardNames.some(cardName => util.equals(cardName, expected, customEqualityMatchers));

                result.pass = isPromptingAbility && includesCard;

                if(result.pass) {
                    result.message = `Expected ${actual.name} not to be allowed to trigger ${expected} but it is.`;
                } else {
                    result.message = `Expected ${actual.name} to be allowed to trigger ${expected} but it isn't.`;
                }

                return result;
            }
        };
    },
    toAllowSelect: function(util, customEqualityMatchers) {
        return {
            compare: function(actual, expected) {
                let result = {};
                if(typeof expected !== 'string') {
                    expected = expected.title;
                }

                let selectableCardTitles = actual.player.getSelectableCards().map(card => card.title);
                let includesCard = selectableCardTitles.some(cardTitle => util.equals(cardTitle, expected, customEqualityMatchers));

                result.pass = includesCard;

                if(result.pass) {
                    result.message = `Expected ${actual.name} not to be allowed to select ${expected} but it is.`;
                } else {
                    result.message = `Expected ${actual.name} to be allowed to select ${expected} but it isn't.`;
                }

                return result;
            }
        };
    }
};

beforeEach(function() {
    jasmine.addMatchers(customMatchers);
});

global.integration = function(options, definitions) {
    if(typeof(options) === 'function') {
        definitions = options;
        options = {};
    }

    describe('integration', function() {
        beforeEach(function() {
            this.flow = new GameFlowWrapper(options);

            this.game = this.flow.game;
            for(let player of this.flow.allPlayers) {
                this[player.name] = player;
                this[player.name + 'Object'] = this.game.getPlayerByName(player.name);
            }

            for(let method of ProxiedGameFlowWrapperMethods) {
                this[method] = (...args) => this.flow[method].apply(this.flow, args);
            }

            this.buildDeck = function(properties) {
                return deckBuilder.buildDeck(properties);
            };
        });

        definitions();
    });
};
