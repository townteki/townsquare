class ReferenceConditionalSetProperty {
    constructor() {
        this.references = new Map();
    }

    add(key, source, condition = () => true) {
        let lowerCaseKey = key.toLowerCase();
        let currentRefArray = this.references.get(lowerCaseKey) || [];
        currentRefArray.unshift({ source: (source ? source.uuid : ''), condition });
        this.references.set(lowerCaseKey, currentRefArray);
    }

    remove(key, source) {
        let lowerCaseKey = key.toLowerCase();
        let currentRefArray = this.references.get(lowerCaseKey);
        if(currentRefArray) {
            currentRefArray = currentRefArray.filter(studRef => studRef.source !== (source ? source.uuid : ''));
            if(currentRefArray.length === 0) {
                this.references.delete(lowerCaseKey);
            } else {
                this.references.set(lowerCaseKey, currentRefArray);
            }
        }
    }

    contains(key, conditionContext) {
        let lowerCaseValue = key.toLowerCase();
        let currentRefArray = this.references.get(lowerCaseValue);
        if(!currentRefArray || currentRefArray.length === 0) {
            return false;
        }
        
        return !currentRefArray[0].condition || currentRefArray[0].condition(conditionContext);
    }

    getReferenceArray(key) {
        let lowerCaseValue = key.toLowerCase();
        return this.references.get(lowerCaseValue) || [];
    }

    clear() {
        this.references.clear();
    }

    size() {
        let size = 0;

        for(let count of this.references.values()) {
            if(count > 0) {
                size += 1;
            }
        }

        return size;
    }

    clone() {
        let clonedSet = new ReferenceConditionalSetProperty();
        clonedSet.references = new Map(this.references);
        return clonedSet;
    }
}

module.exports = ReferenceConditionalSetProperty;
