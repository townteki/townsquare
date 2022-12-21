class SelfCost {
    constructor(action, unpayAction) {
        this.action = action;
        this.unpayAction = unpayAction;
        this.name = 'self' + this.action.name;
    }

    canPay(context) {
        return this.action.isEligible(context.source, context);
    }

    resolve(context, result = { resolved: false }) {
        context.addCost(this.name, context.source);

        result.resolved = true;
        result.value = context.source;
        return result;
    }

    pay(context) {
        this.action.pay(context.getCostValuesFor(this.name), context);
    }

    canUnpay(context) {
        return !!this.unpayAction && this.unpayAction.isEligible(context.source, context);
    }

    unpay(context) {
        this.unpayAction.pay([context.source], context);
    }
}

module.exports = SelfCost;
