'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');

function getDeckCount(deck) {
    var count = 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = deck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cardEntry = _step.value;

            count += cardEntry.count;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return count;
}

function isCardInReleasedPack(packs, card) {
    var pack = packs.find(function (pack) {
        return card.packCode === pack.code;
    });

    if (!pack) {
        return false;
    }

    var releaseDate = pack.releaseDate;

    if (!releaseDate) {
        return false;
    }

    releaseDate = moment(releaseDate, 'YYYY-MM-DD');
    var now = moment();

    return releaseDate <= now;
}

var legendRules = {};

var DeckValidator = function () {
    function DeckValidator(packs) {
        _classCallCheck(this, DeckValidator);

        this.packs = packs;
    }

    _createClass(DeckValidator, [{
        key: 'validateDeck',
        value: function validateDeck(deck) {
            var errors = [];
            var unreleasedCards = [];
            var rules = this.getRules(deck);
            var drawCount = getDeckCount(deck.drawCards);

            if (drawCount < rules.requiredDraw) {
                errors.push('Too few draw cards');
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = rules.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var rule = _step2.value;

                    if (!rule.condition(deck)) {
                        errors.push(rule.message);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var allCards = deck.drawCards;
            var cardCountByName = {};

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = allCards[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var cardQuantity = _step3.value;

                    cardCountByName[cardQuantity.card.name] = cardCountByName[cardQuantity.card.name] || { name: cardQuantity.card.name, type: cardQuantity.card.type, limit: cardQuantity.card.deckLimit, count: 0 };
                    cardCountByName[cardQuantity.card.name].count += cardQuantity.count;
                    if (!isCardInReleasedPack(this.packs, cardQuantity.card)) {
                        unreleasedCards.push(cardQuantity.card.title + ' is not yet released');
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.values(cardCountByName)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var card = _step4.value;

                    if (card.count > card.limit) {
                        errors.push(card.name + ' has limit ' + card.limit);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var isValid = errors.length === 0;

            return {
                status: !isValid ? 'Invalid' : unreleasedCards.length === 0 ? 'Valid' : 'Unreleased Cards',
                drawCount: drawCount,
                extendedStatus: errors.concat(unreleasedCards),
                isValid: isValid
            };
        }
    }, {
        key: 'getRules',
        value: function getRules(deck) {
            var standardRules = {
                requiredDraw: 52
            };
            var outfitRules = this.getOutfitRules();
            var legendRules = this.getLegendRules(deck);
            return this.combineValidationRules([standardRules, outfitRules].concat(legendRules));
        }
    }, {
        key: 'getOutfitRules',
        value: function getOutfitRules() {
            //No inclusion restrictions for outfit as of TCaR
            return [];
        }
    }, {
        key: 'getLegendRules',
        value: function getLegendRules(deck) {
            if (!deck.legend) {
                return [];
            }

            var allLegends = [];
            return allLegends.map(function (legend) {
                return legendRules[legend.code];
            });
        }
    }, {
        key: 'combineValidationRules',
        value: function combineValidationRules(validators) {
            var mayIncludeFuncs = validators.map(function (validator) {
                return validator.mayInclude;
            }).filter(function (v) {
                return !!v;
            });
            var cannotIncludeFuncs = validators.map(function (validator) {
                return validator.cannotInclude;
            }).filter(function (v) {
                return !!v;
            });
            var combinedRules = validators.reduce(function (rules, validator) {
                return rules.concat(validator.rules || []);
            }, []);
            var combined = {
                mayInclude: function mayInclude(card) {
                    return mayIncludeFuncs.some(function (func) {
                        return func(card);
                    });
                },
                cannotInclude: function cannotInclude(card) {
                    return cannotIncludeFuncs.some(function (func) {
                        return func(card);
                    });
                },
                rules: combinedRules
            };

            return Object.assign.apply(Object, [{}].concat(_toConsumableArray(validators), [combined]));
        }
    }]);

    return DeckValidator;
}();

module.exports = DeckValidator;