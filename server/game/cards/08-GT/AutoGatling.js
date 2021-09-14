const GoodsCard = require('../../goodscard.js');

class AutoGatling extends GoodsCard {
	setupCardAbilities(ability) {
		this.attachmentRestriction(card => 
			card.controller === this.controller &&
			(card.getType() === 'deed' || card.getType() === 'outfit')
		);
		this.persistentEffect({
			condition: () => this.game.shootout && this.parent && this.parent === this.game.getShootoutLocationCard(),
			match: this.owner,
			effect: ability.effects.modifyPosseStudBonus(2)
		});
		this.persistentEffect({
			condition: () => this.parent,
			match: card => card.getType() === 'dude' && 
				card.controller !== this.owner &&
				!card.booted && 
				card.locationCard === this.parent,
			effect: [ability.effects.modifyInfluence(-1)]
		});
	}
}

AutoGatling.code = '14022';

module.exports = AutoGatling;
