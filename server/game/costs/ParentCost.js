class ParentCost {
    constructor(action) {
        this.action = action;
        this.name = 'parent' + this.action.name;
    }

    canPay(context) {
        return !!context.source.parent && context.source.parent.controller.equals(context.source.controller) && this.action.isEligible(context.source.parent, context);
    }

    resolve(context, result = { resolved: false }) {
        context.addCost(this.name, context.source.parent);

        result.resolved = true;
        result.value = context.source.parent;
        return result;
    }

    pay(context) {
        this.action.pay(context.getCostValuesFor(this.name), context);
    }
}

module.exports = ParentCost;
