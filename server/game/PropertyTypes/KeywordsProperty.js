const ReferenceCountedSetProperty = require('./ReferenceCountedSetProperty');

class KeywordsProperty {
    constructor(keywordsString = '') {
        this.data = new ReferenceCountedSetProperty();
        this.printedData = [];
        // this.modifiers.printed: represents printed rating of the skill or difficulty
        // this.modifiers.modifier: represents change to the printed rating
        //             example - blessed: { printed: 2, modifier: -1 } = blessed 1
        this.modifiers = {
            'difficulty': { printed: null, modifier: 0 },
            'experienced': { printed: null, modifier: 0 },
            'mad scientist': { printed: null, modifier: 0 },
            'blessed': { printed: null, modifier: 0 },
            'huckster': { printed: null, modifier: 0 },
            'shaman': { printed: null, modifier: 0 },
            'kung fu': { printed: null, modifier: 0 }
        };
        this.parseKeywords(keywordsString);
    }

    parseKeywords(keywords) {
        if(keywords === '') {
            return;
        }

        var firstLine = keywords.split('\n')[0];

        firstLine.split('\u2022').forEach(keyword => this.addKeyword(keyword, true));
    }

    setPrintedValues(results) {
        let keywordName = results[1].toLowerCase().trim();
        this.printedData.push(keywordName);   
        if(isNaN(results[2])) {
            return;
        }
        let value = parseInt(results[2]);

        if(!this.modifiers[keywordName]) {
            this.modifiers['difficulty'].printed = value;
        } else {
            this.modifiers[keywordName].printed = value;
        }
    }

    addKeyword(keyword, isPrinted = false) {
        let results = /([a-z A-Z]+)(\d*)$/.exec(keyword.toLowerCase().trim());  
        if(results) {
            this.add(results[1].trim());
            if(isPrinted) {
                this.setPrintedValues(results);
            }
        }
    } 

    removeKeyword(keyword) {
        this.remove(keyword);
        if(!this.contains(keyword) && this.modifiers[keyword]) {
            this.modifiers[keyword].modifier = 0;
        }
    }

    add(value) {
        this.data.add(value);
    }

    remove(value) {
        this.data.remove(value);
    }

    contains(value) {
        return this.data.contains(value);
    }

    getValues() {
        return this.data.getValues();
    }

    getValue(keyword) {
        return this.data.getValue(keyword);
    }

    size() {
        return this.data.size();
    }

    clone() {
        let cloned = new KeywordsProperty();
        cloned.data = this.data.clone();
        cloned.printedData = [...this.printedData];
        cloned.modifiers = {...this.modifiers};
        return cloned;
    }

    hasPrintedKeyword(keyword) {
        return this.printedData && this.printedData.includes(keyword);
    }

    getSkillRating(skillName, printed = false) {
        let skill = this.modifiers[skillName];
        if(!skill) {
            return;
        }
        if(printed) {
            return skill.printed;
        } 
        if(skill.printed + skill.modifier < 0) {
            return 0;
        } 
        return skill.printed + skill.modifier;
    }

    modifySkillRating(skillName, amount) {
        this.modifiers[skillName].modifier += amount;   
    }

    getDifficulty(printed = false) {
        let difficulty = this.modifiers['difficulty'];
        if(!difficulty) {
            return;
        }
        if(printed) {
            return difficulty.printed;
        } 
        if(difficulty.printed + difficulty.modifier < 0) {
            return 0;
        } 
        return difficulty.printed + difficulty.modifier;
    }

    modifyDifficulty(amount) {
        this.modifiers['difficulty'].modifier += amount;   
    }

    getExperienceLevel(printed = false) {
        let experienced = this.modifiers['experienced'];
        if(!experienced) {
            return;
        }
        if(printed) {
            return experienced.printed;
        } 
        if(experienced.printed + experienced.modifier < 0) {
            return 0;
        } 
        return experienced.printed + experienced.modifier;
    }

    modifyExperienceLevel(amount) {
        this.modifiers['experienced'].modifier += amount;   
    }
}

module.exports = KeywordsProperty;
