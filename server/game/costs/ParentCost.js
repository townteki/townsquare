class ParentCost {
    constructor(action) {
        this.action = action;
        this.name = 'parent' + this.action.name;
    }

    canPay(context) {
        const parentToBoot = this.getParentToBoot(context);
        return !!parentToBoot && parentToBoot.controller.equals(context.source.controller) && this.action.isEligible(parentToBoot, context);
    }

    resolve(context, result = { resolved: false }) {
        const parentToBoot = this.getParentToBoot(context);
        context.addCost(this.name, parentToBoot);

        result.resolved = true;
        result.value = parentToBoot;
        return result;
    }

    pay(context) {
        this.action.pay(context.getCostValuesFor(this.name), context);
    }

    getParentToBoot(context) {
        const parentToBoot = context.source.isTotem() ? context.source.locationCard : context.source.parent;
        return parentToBoot || context.source.parent;
    }
}

module.exports = ParentCost;
