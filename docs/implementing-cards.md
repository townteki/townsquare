
## Implementing Cards

Contents:
 - [Getting Started](#Getting started)
 - [Keywords]
 - [Persistent effects]
	- [Matching conditions vs matching specific cards]
	- [Conditional effects]
	- [Targeting opponent or all matching cards]
	- [Dynamic effects]
	- [Attachment-based effects]
	- [Applying multiple effects at once]
	- [Applying effects to cards in hand]
	- [Player modifying effects]
 - [Lasting effects]
 - [Actions]
 	- [Regular action]
 	- [Jobs]
 	- [Spells]
 	- [Ability messages](#Ability messages)
 	- [Checking ability restrictions](#Checking ability restrictions)
 	- [Paying additional costs for action](#Paying additional costs for action)
 	- [Choosing / targeting cards](#Choosing / targeting cards)
 	- [Non-targeting card choices](#Non-targeting card choices)
 	- [Cancelling an action](#Cancelling an action)
 	- [Limiting the number of uses](#Limiting the number of uses)
 	- [Actions outside of play](#Actions outside of play)
 - [Triggered abilities](#Triggered abilities)
	- [Declaring triggered abilities](#Declaring triggered abilities)

### Getting started

We recommend using VScode for implementing a card as there are many snippets that will help you.
Whenever we refer to **action**, we mean also _spell_ and _job_ actions. 
Whenever we mention **triggered abilities**, we mean _reaction_, _spell_reaction_, _traitReaction_ (in the future there can be some kind of interrupts also)
Whenever you need to perform some basic game action, such as discard a card, boot a card, join posse, call out a dude or other refer to the [Game actions](#Game actions) section.
Whenever you need to do something base on event, refer to the [Events](#Events) section for the event names. !!! M2 later will also add event parameters !!!
To implement a card, follow these steps:

#### 1. Create a file named after the card.

Cards are organized under the `/server/game/cards` directory by grouping them by "\<cycle number>-\<pack code>". Each word in the file name should be capitalized.

```
/server/game/cards/01-DTR/SunInYerEyes.js
/server/game/cards/02.2-DD/ItsNotWhatYouKnow.js
```

#### 2. Create a class for the card and export it.

Each card type has its own class and snippet.
_Dude_ - snippet: `dudecard`, class: `DudeCard`
_Deed_ - snippet: `deedcard`, class: `DeedCard`
_Goods_ - snippet: `goodscard`, class: `GoodsCard`
_Spell_ - snippet: `spellcard`, class: `SpellCard`
_Action_ - snippet: `actioncard`, class: `ActionCard`
_Outfit_ - snippet: `outfitcard`, class: `OutfitCard`

In case you are using snippet, just type the snippet prefix (e.g. `dudecard`) and VSCode should give you suggestion. If not, press Ctrl+space.

The card class should have its `code` property set to the unique card identifier for that card. You can find these in `/server/game/cards/cards_summary.csv`, or on [dtdb.co](https://dtdb.co/) by looking at the URL for the specific card. Or by combining the 2-digit pack number (01) and 3-digit card number (035).

```javascript
const DudeCard = require('../../dudecard.js');

class AllieHensman extends DudeCard {
    // Card definition
}

AllieHensman.code = '01035';

module.exports = AllieHensman;
```

#### 3. Override the `setupCardAbilities` method.

Persistent effects, actions, reactions, spells, jobs and trait reactions should be defined in the `setupCardAbilities` method. This method passes in an `ability` parameter that gives you access to effect implementations and costs. All this will be filled for you if you use snippet.
See below for more documentation.

```javascript
class AllieHensman extends DudeCard {
    setupCardAbilities(ability) {
        // Declare persistent effects, reactions and interrupts here.
    }
}
```

### Keywords

Keywords are automatically parsed from the card text. It isn't necessary to explicitly implement them unless they are provided by a conditional persistent effect.

### Attachment restrictions

**Not yet implemented/updated.**

### Persistent effects

Many cards provide continuous bonuses to other cards you control or detrimental effects to opponents cards in certain situations. These can be defined using the `persistentEffect` method. Cards that enter play while the persistent effect is in play will automatically have the effect applied, and cards that leave play will have the effect removed. If the card providing the effect becomes blank, the effect is automatically removed from all previously applied cards.

For a full list of properties that can be set when declaring an effect, look at `/server/game/effect.js`. Here are some common scenarios:

#### Matching conditions vs matching specific cards

The effect declaration takes a `match` property. In most cases this will be a function that takes a `Card` object and should return `true` if the effect should be applied to that card.

```javascript
// While Vasilis is in a shootout, each wanted dude in the opposing posse has -2 value.
this.persistentEffect({
    match: card => card.getType() === 'dude' && card.isOpposing(this.controller) && card.isWanted(),
    effect: ability.effects.modifyValue(-2)
});
```

In some cases, an effect should be applied to a specific card. While you could write a `match` function to match only that card, you can provide the `Card` object as a shorthand.

```javascript
// While in a Saloon you own, Clementine gets +1 influence and cannot be called out.
this.persistentEffect({
    condition: () => this.locationCard.hasKeyword('Saloon') && this.locationCard.owner === this.controller,
    match: this,
    effect: [
        ability.effects.modifyInfluence(1),
        ability.effects.cannotBeCalledOut()
    ]
});
```

If you need the persistent effect to be rechecked after some specific events (e.g. deed was added to the street), you do not specify these events but you add always-on condition.

```javascript
// Increase the production of the leftmost deed in each other street by 2.
this.persistentEffect({
    targetController: 'any',
    condition: () => true,
    match: card => card.getType() === 'deed' && !card.isSameStreet(this) && card.owner.leftmostLocation() === card.getGameLocation(),
    effect: ability.effects.modifyProduction(2)
});
```

#### Conditional effects

Some effects have a 'when', 'while', 'during' or 'if' clause within their text. These cards can be implemented by passing a `condition` function into the persistent effect declaration. The effect will only be applied when the function returns `true`. If the function returns `false` later on, the effect will be automatically unapplied from the cards it matched.

```javascript
// Jake has +2 influence during the Sundown phase.
this.persistentEffect({
    condition: () => this.game.currentPhase === 'sundown',
    match: this,
    effect: ability.effects.modifyInfluence(2)
});
```

#### Targeting opponent or all matching cards

By default, an effect will only be applied to cards controlled by the current player. The `targetController` property can be modified to specify which players' cards should be targeted.

To target only opponent cards, set `targetController` to `'opponent'`:

```javascript
// No example implemented yet.

```

To target all cards regardless of who controls them, set `targetController` to `'any'`:

```javascript
// While Buford is at a Saloon or Casino, reduce his upkeep and the production of the deed by 1.
this.persistentEffect({
    targetController: 'any',
    condition: () => this.location === 'play area' && this.locationCard.hasOneOfKeywords(['Saloon', 'Casino']),
    match: card => card.uuid === this.gamelocation,
    effect: ability.effects.modifyProduction(-1)
});
```

#### Dynamic effects

A few cards provide dynamic bonuses/penalties based on game state. For example, Maza Gang Hideout's productions is based on the number of adjacent locations. A `dynamicProduction` effect exists that takes a function to determine what the production bonus is currently.

```javascript
// This deed has +1 production for each adjacent location.
this.persistentEffect({
    match: this,
    effect: ability.effects.dynamicProduction(() => this.adjacentLocations().length)
});
```

Similar effect is for dynamic bullets of Wylie Jenks.

```javascript
// Wylie has +1 bullet for each wanted dude in the opposing posse.
this.persistentEffect({
    condition: () => this.isParticipating(),
    match: this,
    effect: ability.effects.dynamicBullets(() => this.game.shootout.opposingPosse.getDudes(dude => dude.isWanted()).length)
});
```

#### Attachment-based effects

A `whileAttached` method is provided to define persistent effects that are applied to the card an attachment is attached. These effects remain as long as the card is attached to its parent and the attachment has not been blanked.

```javascript
// Attached dude becomes a stud.
this.whileAttached({
    effect: ability.effects.setAsStud(this.uuid)
});
```

If the effect has an additional requirement, an optional `match` or `condition` function can be passed in.
```javascript
// While they are not wanted, this dude gets +1 influence.
this.whileAttached({
    condition: () => !this.parent.isWanted(),
    effect: ability.effects.modifyInfluence(1)
});
```

#### Applying multiple effects at once
As a shorthand, it is possible to pass an array into the `effect` property to apply multiple effects that have the same conditions / matching functions.

```javascript
// While he has a Hex, Ivor gets +1 bullets, +1 influence, and +1 Huckster skill.
this.persistentEffect({
    condition: () => this.hasAttachment(attachment => attachment.getType() === 'spell' && attachment.isHex()),
    match: this,
    effect: [
        ability.effects.modifyBullets(1),
        ability.effects.modifyInfluence(1),
        ability.effects.modifySkillRating(1, 'huckster')
    ]
});
```

#### Applying effects to cards in hand

By default, effects will only be applied to cards in the play area.  Certain cards effects refer to cards in your hand, such as reducing their cost. In these cases, set the `targetLocation` property to `'hand'`.

```javascript
// Not yet implemented.
```

#### Player modifying effects

Certain cards provide bonuses or restrictions on the player itself instead of on any specific cards. Such effects can be implemented setting the `targetType` to `'player'`.

```javascript
effectName: function() {
    targetType: 'player',
    // ...
}
```

```javascript
// Not yet implemented.
this.persistentEffect({
    targetController: 'current',
    effect: ability.effects.effectName()
});
```

### Lasting effects

Unlike persistent effects, lasting effects are typically applied during an action or reaction and expire after a specified period of time.  Because lasting effects can be applied almost anywhere, each method takes a factory function that provides the `ability` object and should return the effect properties. The properties returned when applying these effects are identical to those of persistent effects, but additional methods are provided to apply them immediately with the correct duration.

Mostly you will be using lasting effects that adhere to rules for the Noon and Shootout abilities:
Effects caused by a Noon ability last until the end of the day (that is, through the end of the Sundown phase, but before the next Gamblin' phase). Effects caused by Shootout abilities last until the end of that particular shootout before expiring. Unless stated otherwise, ongoing effects created by reacts last until the end of the current shootout or phase, whichever comes first. 

**Important: These should not be used within setupCardAbilities, only within handler code for actions and triggered abilities.**

To apply an effect for action that expires based on action type, use `applyAbilityEffect`. Next example is for _Sun In Yer Eyes_ which has `playType` "shootout" (will be explained in [Actions](#Actions) chapter), therefore the `applyAbilityEffect` automatically sets duration only for the shootout:
```javascript
// Choose a dude in this shootout. That dude gets –2 bullets and becomes a draw.
this.applyAbilityEffect(context.ability, ability => ({
    match: context.target,
    effect: [
        ability.effects.setAsDraw(),
        ability.effects.modifyBullets(-2)
    ]
}));
```

In case the duration of effects was changes (e.g. Orphanage in third example), use following functions.

To apply an effect to last until the end of the current challenge, use `untilEndOfChallenge`:
```javascript
// Until the end of the shootout round, the dude this is attached to gains +1 bullets
this.untilEndOfShootoutRound(ability => ({
    match: card => card === this.parent,
    effect: ability.effects.modifyBullets(1)
}));
```

To apply an effect to last until the end of the specific (or current if you ommit phase name) phase, use `untilEndOfPhase`:
```javascript
// All deeds with 2 or more control points have -1 control point and +2 production until after the next Upkeep phase.
this.untilEndOfPhase(ability => ({
    condition: () => true,
    match: card => card.getType() === 'deed' && card.control >= 2,
    effect: [
        ability.effects.modifyProduction(2),
        ability.effects.modifyControl(-1)    
    ]
}), 'upkeep'
```

To apply an effect that will expire 'at the end of the phase', use `atEndOfPhase`:
```javascript
// Reduce Mortimers influence to 0 until after Sundown.
this.untilEndOfRound(ability => ({
    match: this,
    effect: ability.effects.setInfluence(0)
}));
```

To apply an effect to last until the end of the round, use `untilEndOfRound`:
```javascript
/// Until the end of the round, add the 'Winter' trait to the specified plot card.
this.untilEndOfRound(ability => ({
    match: plotCard,
    effect: ability.effects.addTrait('Winter')
}));
```

### Actions

Actions are abilities provided by the card text that players may trigger during play windows:
**Noon** - this play window is opened during the high noon phase except shootouts. Actions that can be used during this window use playType `noon`.
**Shootout** - this play window is opened during the shootout plays steps of shootout. Actions that can be used during this window use playType `shootout`.
	- there is specific playType for cards that can be played outside of shootout and which join dude to posse: `shootout:join`
**Resolution** - this play window is opened during the resolution plays step of shootout phase. Actions that can be used during this window use playType `resolution`.
**Cheatin' Resolution** - this play window is opened during the gambling phase and in the resolution plays step of shootout phase. Actions that can be used during this window use playType `cheatin resolution`.

There are 3 different types of actions:
 - regular actions
 - jobs
 - spells

When declaring an action, use the `action`, `job` or `spellAction` method and provide it with a `title` and a `handler` property. The title is not usually seen. It is used only if there are multiple actions for the card. In that case use title that clearly distinguishes between the actions. In other cases just use the card name. The handler is a function to be called when the player chooses to trigger the action. The handler receives a context object as its only parameter which contains the `player` executing the action, and the `source` card that triggered the ability.

#### Regular action

Use the `action` method when declaring.
See `/server/game/cardaction.js` for full documentation. Most of the action propertie will be filled out for you if you use snippet `cardaction`.

```javascript
class WinchesterModel1873 extends DrawCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Winchester Model 1873',
            playType: 'shootout',
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            handler: context => {
                // Code to set parent as stud and give them +1 bullets
            }
        });
    }
}
```

#### Jobs

Use the `job` method when declaring. Provide it `bootLeader` property to specify if leader should boot to perform the job. Default is true. To specify what should happen in case job succeeds, provide it `onSuccess` property, or `onFail` property respectively if job fails. 
Specific targets (marks) for job (`target` property):
 - `'townsquare'` in case job marks Town Square
 - `'currentHome'` in case job marks its home
 - `'location'` in case job marks any location

See `/server/game/jobaction.js` for full documentation. Most of the action propertie will be filled out for you if you use snippet `cardjob`.

```javascript
this.job({
    title: 'A Coach Comes to Town',
    playType: 'noon',
    target: 'townsquare',
    handler: context => {
        this.game.addMessage('{0} plays {1} marking {2}.', context.player, this, context.target);
    },
    onSuccess: () => {
        this.owner.modifyGhostRock(4);
        this.game.addMessage('{0} successfuly escorts the coach and gets 4 GR.', this.owner);
    },
    onFail: () => {
        this.owner.getOpponent().modifyGhostRock(4);
        this.game.addMessage('{0} fails to protect the coach and {1} gets 4 GR.', this.owner, this.owner.getOpponent());
    }
});
```

In case you need something specific to happen before the job shootout starts, use `handler` property.

```javascript
this.job({
    title: 'Kidnappin\'',
    playType: 'noon',
    bootLeader: true,
    target: {
	// target definition
    },
    handler: context => {
        this.game.once('onLeaderPosseFormed', event => event.shootout.actOnLeaderPosse(dude => dude.increaseBounty()));
        this.game.addMessage('{0} plays {1} on {2}.', context.player, this, context.target);
    },
    onSuccess: (job) => {
	// On success handler
    }
});
```

#### Spells

Use the `spellAction` method when declaring. Provide it `difficulty` property to specify number or function representing the difficulty of the spell. If it is function, it takes context as parameter. To specify what should happen in case spell succeeds, provide it `onSuccess` property, or `onFail` property respectively if job fails.
See `/server/game/spellaction.js` for full documentation. Most of the action propertie will be filled out for you if you use snippet `spellaction`.

**Important**: Context includes also `pulledCard`, `difficulty` and `totalPulledValue` properties. `difficulty` will contain final difficulty (e.g. grit), 	`totalPulledValue` will contain value of pulled card with all bonuses.

```javascript
this.spellAction({
    title: 'Soul Blast',
    playType: 'shootout',
    cost: ability.costs.bootSelf(),
    target: {
	// target definition
    },
    difficulty: context => context.target.getGrit(),
    onSuccess: (context) => {
    	if(context.totalPullValue - 6 >= context.difficulty) {
		// ace target
	} else {
		// send target home booted
	}
    },
    onFail: (context) => {
	// send parent home booted
    },
    source: this
});
```

```javascript
this.spellAction({
    title: 'Title',
    playType: 'Noon',
    difficulty: 5,
    onSuccess: (context) => {
	// On success handler
    }
});
```

#### Ability messages

The `message` property can be used to add a message to the game log outside of the `handler` function. By separating the message from the handler that executes the ability, messages can be added to the game log prior to prompting to cancel abilities (e.g. Slight Modification, etc).

The `message` property can be just a string if there are no additional arguments. `{player}` will be replaced with the player initiating the ability, `{source}` will be replaced with the card associated with the ability, and `{target}` will be replaced with the target for the ability (if any):

```javascript
this.action({
    // ...
    message: '{player} boots {source} to ace {target}',
    handler: () => {
        // ...
    }
});
```

When you have additional parameters needed for the message, the `message` property can be an object with a `format` sub-property for the message format, and an `args` sub-property for the additional arguments. The keys of the `args` sub-property correspond to the replacement name, and the values correspond to a function that takes the `context` object and returns the appropriate argument value:
```javascript
this.action({
    // ...
    message: {
        format: '{player} uses {source} to put {target} into play from {targetOwner}\'s discard pile.',
        args: {
            targetOwner: context => context.target.owner
        }
    },
    handler: () => {
        // ...
    }
});
```

Finally, you can pass a function to the `message` property that will be executed:
```javascript
this.action({
    // ...
    message: context => this.game.addMessage('{0} uses {1} to ace {2}', context.player, this, context.target),
    handler: () => {
        // ...
    }
});
```

#### Checking ability restrictions

Card abilities can only be triggered if they have the potential to modify game state (outside of paying costs). To ensure that the action's play restrictions are met, pass a `condition` function that returns `true` when the restrictions are met, and `false` otherwise. If the condition returns `false`, the action will not be executed and costs will not be paid.

```javascript
this.action({
    title: 'Unboot attached dude',
    // Ensure that the parent card is booted
    condition: () => this.parent.booted,
    // ...
});
```

#### Paying additional costs for action

Some actions have an additional cost, such as booting the card. In these cases, specify the `cost` parameter. The action will check if the cost can be paid. If it can't, the action will not execute. If it can, costs will be paid automatically and then the action will execute.

For a full list of costs, look at `/server/game/costs.js`.

```javascript
this.action({
    title: 'Unboot attached dude',
    // This card must be booted as a cost for the action.
    cost: ability.costs.bootSelf(),
    // ...
});
```

If a card has multiple costs, an array of cost objects may be sent using the `cost` property.

```javascript
this.action({
    title: 'Do some action',
    // This card AND parent must be booted as a cost for the action.
    cost: [
        ability.costs.bootSelf(),
        ability.costs.bootParent()
    ],
    // ...
});
```

#### Choosing / targeting cards

Cards that specify to 'choose' or otherwise target a specific card can be implemented by passing a `target` property, At minimum, the target property must have an `activePromptTitle` to be used as the prompt text, and a `cardCondition` function that returns `true` for valid targets. Any other properties that apply to `Game.promptForSelect` are valid.

```javascript
this.action({
    title: 'Do action that targets a Deputy',
    target: {
        // activePromptTitle: 'Select a dude',  // <- default prompt message, overridable
	location: 'play area',
        cardCondition: card => card.hasTrait('Deputy'),
	cardType: 'dude
    },
    // ...
});
```

The card that was chosen will be set on the `target` property of the context object passed to the handler.

```javascript
this.action({
    // ...
    handler: context => {
        this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.target);
        this.controller.unbootCard(context.target);
    }
});
```

Some card abilities require multiple targets. These may be specified using the `targets` property. Each sub key under `targets` is the name that will be given to the chosen card, and the value is the prompt properties.

```javascript
this.action({
    title: 'Modify bullets of two dudes',
    targets: {
        toLower: {
            activePromptTitle: 'Select a dude to get -1 bullet',
            cardCondition: card => this.cardCondition(card)
        },
        toRaise: {
            activePromptTitle: 'Select a dude to get +1 bullet',
            cardCondition: card => this.cardCondition(card)
        }
    },
    // ...
});
```

Once all targets are chosen, they will be set using their specified name under the `targets` property on the handler context object.

```javascript
this.action({
    // ...
    handler: context => {
	this.applyAbilityEffect(context.ability, ability => ({
            match: context.targets.toLower,
            effect: ability.effects.modifyBullets(-1)
	}));
	this.applyAbilityEffect(context.ability, ability => ({
            match: context.targets.toRaise,
            effect: ability.effects.modifyBullets(1)
	}));
    }
});
```

#### Non-targeting card choices

Some abilities such as Tears of Lys require selecting a target but do not count as targeting because the ability does not use the word 'choose'. These abilities can be implemented using the target API but should specify the `type` property as `'select'`. This will prevent immunity from being checked as well as properly interact with cards that modify targeting.

```javascript
this.action({
    // ...
    target: {
        type: 'select',
        // ...
    },
    // ...
});
```

#### Cancelling an action

If after checking play requirements and paying costs an action needs to be cancelled for some reason, simply return `false` from the handler. **Note**: This should be very rare.

```javascript
this.action({
    title: 'Do something',
    handler: () => {
        if(!this.canDoIt()) {
            return false;
        }

        // normal handler code
    }
});
```

If an action is cancelled in this manner, it is not counted towards any 'limit X per challenge/phase/round' requirements.


#### Limiting an action to a specific phase

!!! M2 we will not probably need this
You should not use this very often as the abilities phase limitation is determined automatically based on rules. That means play type `'shootout'`, `'shootout:join'` or `'resolution'` can only be played during shootout phase, `'noon'` only during high noon phase and `'cheatin resolution'` only during shootout or gambling.
But if you need to limit to a specific phase in other cases, you can pass an optional `phase` property to the action to limit it to just that phase. Valid phases include `'gambling'`, `'upkeep'`, `'high noon'`, `'shootout'`, `'sundown'`. The default is `'any'` which allows the action to be triggered in any phase.

```javascript
this.action({
    title: 'Do something in shootout',
    phase: 'shootout',
    // ...
});
```

#### Limiting the number of uses

!!! M2 not sure this is used in DTR
Some actions have text limiting the number of times they may be used in a given period. You can pass an optional `limit` property using one of the duration-specific ability limiters.

```javascript
this.action({
    title: 'Put a card with printed cost of 5 or lower in play',
    limit: ability.limit.perPhase(1),
    // ...
});
```

#### Actions outside of play

!!! M2 not sure this is used in DTR
Certain actions, such as those for Dolorous Edd, can only be activated while the character is in hand. Such actions should be defined by specifying the `location` property with the location from which the ability may be activated. The player can then activate the ability by simply clicking the card. If there is a conflict (e.g. both the ability and normal marshaling can occur), then the player will be prompted.

```javascript
this.action({
    title: 'Add Dolorous Edd as a defender',
    location: 'hand',
    // ...
})
```

### Triggered abilities

Triggered abilities include all card abilities that have **React**, or trait starting with `When`, `Whenever`, `If you` and others that are tied to a specific game action.
For full documentation of properties, see `/server/game/promptedtriggeredability.js` and `/server/game/traittriggeredability.js`.

#### Declaring triggered abilities

Each triggered ability has an associated triggering condition. This is done using the `when` property. This should be an object whose sub-property is the name of the event, and whose value is a function with the parameters of that event. When the function returns `true`, the ability will be executed. !!! M2 should also provide list of events

#### React

Reactions are a yes / no choice on whether the player wants to activate the ability or not on a specific event. For these, it's usually only necessary to provide a `when` event listener, the `handler` method, and `cost`. There 
are some additional properties (e.g. `repeatable`), for full documentation of properties, see `/server/game/cardreaction.js`.

```javascript
this.reaction({
    when: {
        onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
    },
    repeatable: true,
    handler: context => {
		// make Jacqueline a stud
    }
});
```

In rare cases, there may be multiple triggering conditions for the same ability. For example, !!M2 not sure there is any such card!!. In these cases, just defined an additional event on the `when` object.

```javascript
this.reaction({
    when: {
        onDudeJoinedPosse: (event) => checkEvent(event),
        onDudeLeftPosse: (event) => checkEvent(event)
    },
    handler: () => {
        // do something
    }
});
```

#### Trait reactions

Trait reactions do not provide the player with a choice - unless cancelled, the provided `handler` method will always be executed.

To declare a trait reaction, use the `traitReaction` method:

```javascript
// After opponent reveals cheatin' hand, raise your hand rank.
this.traitReaction({
    when: {
        onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.getOpponent().isCheatin()
    },
    handler: () => {
		// raise your hand rank
    }
});
```

#### Multiple choice reactions

A few cards provide reactions that have more than a yes or no choice. For example, !!! M2 not sure if there is any react ability that have choices !!!. In these cases, instead of sending a `handler` method, a `choices` object may be provided. Each property under the `choices` object will be used as the prompt button text, while the value will be the function to be executed if the player chooses that option. The option to decline / cancel the ability is provided automatically and does not need to be added to the `choices` object.

```javascript
this.reaction({
    when: {
        // some event
    },
    choices: {
        'Gain 1 influence': () => {
            // code to gain 1 influence
        },
        'Gain 1 bullet': () => {
            // code to gain 1 bullet
        }
    }
});
```

#### Paying additional costs for reactions

Some abilities have an additional cost, such as booting the card. In these cases, specify the `cost` parameter. The ability will check if the cost can be paid. If it can't, the ability will not prompt the player. If it can, costs will be paid automatically and then the ability will execute.

For a full list of costs, look at `/server/game/costs.js`.

```javascript
this.reaction({
    when: {
        // some event
    }
    // This card must be booted as a cost for the action.
    cost: ability.costs.bootSelf(),
    handler: () => {
        // Gain 1 control point.
    }
});
```

If a card has multiple costs, an array of cost objects may be sent using the `cost` property.

```javascript
this.reaction({
    when {
        // some event
    }
    // This card must be booted AND 2 GR paid as a cost for the action.
    cost: [
        ability.costs.bootSelf(),
        ability.costs.payReduceableGRCost(2)
    ],
    handler: () => {
        // do something
    }
});
```

#### Limiting the number of uses

!!! M2 there is no card implemented that would need this that is useing React!!!
Some repeatable abilities have limiting number of times they may be used in a given period. You can pass an optional `limit` property.

```javascript
this.reaction({
    when: {
        // event
    },
    // limit once
	repeatable: true,
    limit: 1,
    handler: () => {
        // do something
    }
});
```

#### Game actions

Do not confuse this with card actions, these are specific actions that can be performed as part of card abilities. For example Philip Swinford would discard a card and then draw a card. The game actions in the handler of his ability will look like this:

```javascript
this.game.resolveGameAction(GameActions.discardCard({ card: card }, context)).thenExecute(() => {
    this.game.resolveGameAction(GameActions.drawCards({ player: player, amount: 1 }), context)
});
```

Another example of a card that would kick someone to townsquare booted:
	
```javascript
this.game.resolveGameAction(GameActions.moveDude({ 
    card: card, 
    targetUuid: this.game.townsquare.uuid, 
    options: { needToBoot: true, allowBooted: true } 
}));
```

**Note**: Basic game actions such as booting, unbooting, discarding and acing cards can be done using the `player` functions. All these actions are marked properly in the list of the action games below.

##### List of game actions

**addBounty**
 - `card`: card to which the bounty will be added
 - `amount` (1): amount of bounty to be added
**aceCard** - can be called using `player.aceCard(card, allowSave = true, options)`. If you need to ace multiple cards, you can use `player.aceCards(card, allowSave = true, callback = () => true, options)`
 - `card`: card to be aced
 - `allowSave` (true): (to be added)
 - `source`: source location of the card to be aced
**addToHand**
**bootCard** - can be called using `player.bootCard(card, playType)`. Use playType parameter only if you are performing special kind of booting.
**callOut**
 - `caller`: dude who is doing the Call out
 - `callee`: dude who is being Called out
 - `isCardEffect` (true): *true* if the call out comes from the effect of a card.
 - `canReject` (true): *true* if the callee can reject the call out.
**cancelEffects**
**choose**
**discardCard** - can be called using `player.aceCard(card, allowSave = true, options)`. If you need to ace multiple cards, you can use `player.aceCards(card, allowSave = true, callback = () => true, options)`
 - `card`: card to be discarded
 - `allowSave` (true): (to be added)
 - `source`: source location of the card to be discarded
**discardTopCards**
**drawCards**
**gainGhostRock**
**joinPosse**
 - `card`: dude to join the posse
 - `options`: {
     _isCardEffect_ (true): *true* if the move comes from the effect of a card.
     _moveToPosse_ (true): *true* if the dude should be moved into the shootout location.
     _needToBoot_ (false): *true* if dude has to boot to perform the move, *false* otherwise. This option has effect only if moveToPosse is true.
     _allowBooted_ (true): *true* if even the booted dude can join, *false* otherwise. This option has effect only if moveToPosse is true.
   }
**lookAtDeck**
**lookAtHand**
**moveBounty**
**moveDude**
 - `card`: dude to be moved
 - `targetUuid`: UUID of the location card (can be deed, townsquare or outfit)
 - `options`: {
     _isCardEffect_ (true): *true* if the move comes from the effect of a card
     _needToBoot_ (null): 
		- *true* if dude has to boot to perform the move
		- *false* if dude does not boot to perform the move
        - *null* if the booting will be decided based on the game rules
     _allowBooted_ (false): *true* if even the booted dude can be moved
   }
**moveGhostRock**
**placeToken**
**putIntoPlay**
**removeBounty**
 - `card`: card from which the bounty will be removed
 - `options`: {
     _removeAll_ (false): *true* if all bounty should be removed, *false* otherwise
     _amount_ (1): amount of the bounty to be removed
   }
**removeFromGame**
**returnCardToHand**
**revealCard**
**search** - searches specific location for a card(s).
 - `title`
 - `gameAction`
 - `location`
 - `match`
 - `message`
 - `cancelMessage`
 - `topCards`
 - `numToSelect`
 - `player`
 - `searchedPlay`
 - `handler`
**sendHome**
 - `card`: dude to be sent home
 - `options`: {
     _isCardEffect_ (true): *true* if the action comes from the effect of a card
     _needToBoot_ (true): *true* if dude will be sent home booted, *false* otherwise
     _allowBooted_ (true): *true* if even the booted dude can be sent home, *false* otherwise
   }
**shuffle**
**shuffleIntoDeck**
**simultaneously**
**takeControl**
**unbootCard** - can be called using `player.unbootCard(card)`

#### Events

##### List of events

**Setup**
onDecksPrepared
onSetupFinished

**Gamblin'**
onFirstPlayerDetermined
onDrawHandsRevealed

**Shootout**
onLeaderPosseFormed
onShootoutSlinginLeadStarted
onBeginShootoutRound
onShootoutPhaseStarted
onShootoutPhaseFinished
onDudeLeftPosse
onDrawHandsRevealed

**Sundown**
onSundownAfterVictoryCheck

**Card modification**
onCardBlankToggled
onCardValueChanged
onCardBulletsChanged
onCardInfluenceChanged
onCardProductionChanged
onCardUpkeepChanged
onCardSkillRatingChanged
onCardControlChanged
onCardBountyChanged
onStatChanged

**Phase/Turn timing events**
onBeginRound
onRoundEnded
onPhaseStarted
onPhaseEnded
onAtEndOfPhase - AGOT thing, do we need it?

**Card changing location**
onCardMoved
onDudeMoved
onCardEntersPlay
onCardReturnedToDeck
onCardLeftPlay
onCardLeftHand
onCardEntersHand
onCardEntersDrawHand
onCardPlaced - when card goes to boot hill or discard pile

**Pulls**
onCardPulled
onPullSuccess
onPullFail

**Others**
onBountyCollected
onGhostRockTransferred
onBeforeDeckSearch
onCardTakenControl
onJokerAced
onHandRankModified
onTargetsChosen
onCardAbilityInitiated
onCardAbilityResolved
onPlayWindowOpened
onPlayWindowClosed

### Language

!!! M2 - not sure how to approach this. I do like a little bit of dramatization, not just plain messages !!!

#### Game messages should begin with the player doing the action

Game messages should begin with the name of the player to ensure a uniform format and make it easy to see who triggered an ability.

* **Bad**: Allie Hensman boots to gain 1 control point for Player1
* **Good**: Player1 uses Allie Hensman to gain 1 control rock

#### Game messages should not end in punctuation

No game messages should end in a period, exclaimation point or question mark.

* **Bad**: Player1 draws 2 cards.
* **Good**: Player1 draws 2 cards

#### Game messages should use present tense.

All game messages should use present tense.

* **Bad**: Player1 has used Shotgun to ace Jake Smiley
* **Bad**: Player1 aced Jake Smiley
* **Good**: Player1 uses Shotgun to ace Jake Smiley
* **Good**: Player1 aces Jake Smiley

#### Targeting prompts should use the format "Select a \<card type\>" where possible.

Targeting prompts should ask the player to select a card or a card of particular type to keep prompt titles relatively short.

* **Bad**: Select a dude that is wanted to discard
* **Good**: Select a dude to discard
