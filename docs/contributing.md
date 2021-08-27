# Contributing to Townsquare

:+1::tada: Thanks for taking the time to contribute! :tada::+1:

This page contains the information you need to get started with contributing.

## How Can I Contribute?
 * [Implementing cards](#Implementing-cards) - implement specific card scripts 
 * [Implementing engine features](#Implementing-engine-features) - implement or improve game engine features
 * [Implement unit tests](#Implement-unit-tests) - implement unit test to provide bigger cover
 * [Test and report bugs](#Test-and-report-bugs) - play the game and test various parts and cards
 * [UX and client contributions](#UX-and-client-contributions) - improve user experience and front-end

If you are contribute code, also please read [Coding Guidelines](#Coding-guidelines).

### Implementing cards
Pick up a card to implement from the [list of card scripts](https://github.com/townteki/townsquare/issues?q=is%3Aissue+is%3Aopen+label%3Acard-script) and see [Documentation for implementing cards](https://github.com/townteki/townsquare/blob/master/docs/implementing-cards.md).
Card script issues are divided into categories based on the difficulty:

🟣[good first card](https://github.com/townteki/townsquare/issues?q=is%3Aissue+is%3Aopen+label%3A"good+first+card")🟣 - very easy to implement. Ideal first card for implementation. Please, assign one maximum two of these before moving on to other easy or medium cards.

🟢[easy-script](https://github.com/townteki/townsquare/issues?q=is%3Aissue+is%3Aopen+label%3Aeasy-script)🟢 - relatively easy to implement. Good first card.

🟠[medium-script](https://github.com/townteki/townsquare/issues?q=is%3Aissue+is%3Aopen+label%3Amedium-script)🟠 - no additional code needed, but card is more complicated.

🔴[difficult-script](https://github.com/townteki/townsquare/issues?q=is%3Aissue+is%3Aopen+label%3Adifficult-script)🔴 - card is very complicated or additional code in the game engine is needed.

🟤dependent🟤 - card script dependent on other game engine features that are not yet implemented. Do not pick.

For the IDE setup and other development tips see [Development](#Development) section. 

### Implementing engine features
If you want to contribute to the game engine, let us know in [General discussion](https://github.com/townteki/townsquare/discussions/categories/general) or in [Doomtown Discord](https://discord.com/channels/227387666046386176/377157824725123072).
For the IDE setup and other development tips see [Development](#Development) section. 

### Implement unit tests
Pick up any issue that is labeled `tests`: [Unit test issues](https://github.com/townteki/townsquare/issues?q=is%3Aissue+is%3Aopen+label%3Atests) or if you see any area that is not tested.
For the IDE setup and other development tips see [Development](#Development) section. 

### Test and report bugs
You will be testing the client on the [test server](https://doomtown.us). There is no test plan yet, so you will just play the game and test various game situations. To register on the server, contact [me](mailto:mmeldo@gmail.com) or let us know in [General discussion](https://github.com/townteki/townsquare/discussions/categories/general).
If you encounter any issues on the site or while playing games, please raise an issue with as much detail as possible. In case you do not have a github account and do not want to create one, please use [this report](https://gitreports.com/issue/townteki/townsquare).

**What should be impemented and can be tested:**
 - Game engine overall
 - Chat commands - list of chatcommands can be found in the client `Help > How To Play > Manual Commands`
 - Actin' play depends on implemented cards - see [here](https://github.com/townteki/townsquare/blob/master/docs/cardpool-status.md)

### UX and client contributions
If you want to contribute to the client, let us know in [General discussion](https://github.com/townteki/townsquare/discussions/categories/general) or in [Doomtown Discord](https://discord.com/channels/227387666046386176/377157824725123072).
You will need to checkout also [townsquare-client](https://github.com/townteki/townsquare-client) and install it. On how to install the `townsquare-client` refer to its readme.
For the server, IDE setup and other development tips see [Development](#Development) section. 

## Development

**Requirements:**
- [Node.js](https://nodejs.org/en/download/) - 
  * Linux 
     - Recommended 14.x, working also on 12.x and 10.x
     - use Python 2.7
  * Windows
     - Recommended 10.x, that is the only version we made it to work so far
     - use Python 2.7 (if you have more Python version, use `npm config set python <path/to/python27>`
     - use Visual Studio 2015 build tools: `npm config set msvs_version 2015`
     - to compile native Node modules, you will also need the build tools: `npm install --global --production windows-build-tools`
- [MongoDB](https://www.mongodb.com/) - used as storage so you'll need that installed and running

**Recommended:**
- [Visual Studio code](https://code.visualstudio.com/download) - we recommend to use VS code because there are already some snippets and launch scripts included

**Installation:**

To install the server, execute these commands: 

```
git clone https://github.com/townteki/townsquare.git
cd townsquare
git submodule init
git submodule update
npm install
mkdir server/logs
node server/scripts/fetchdata.js
node server/scripts/importstandalonedecks.js
```

To install the client, you have 2 options:

1. If you want to also work on the client, checkout the [Client Repository](https://github.com/townteki/townsquare-client) and run. You will need to manually copy the card images imported by `fetchdata.js` from `townsquare\public\img\cards` to `townsquare-client\assets\img\cards`.
2. If you do not need the client source, you can download binaries from [townsquare GDrive](https://drive.google.com/file/d/1MdnDSUBYE1Rl0edYYlHaLC3BcSfwx6-7/view?usp=sharing) and unzip it to the `townsquare` repository.

There are two exectuable components and you'll need to configure/run both to run a local server.  First is the lobby server and then there are game nodes.

To run the server, execute these commands:

**Option 1.**

*Linux and Windows*
```
node .
node server/gamenode
```

**Option 2.**

*Linux*
```
NODE_ENV=production PORT=4000 node .
node server/gamenode
```

*Windows*
```
set NODE_ENV=production
set PORT=4000
node .
node server/gamenode
```

If you are working in Visual Studio Code, there are launch configurations for both _Lobby_ ang _Game Server_ in `.vscode/launch.json`.

For the lobby server, if you need to override any of the config settings, create a file named config/local.json5

This will get you up and running in development mode.

## Coding Guidelines

If you are going to contribute code, try and follow the style of the existing code as much as possible and talk to me before engaging in any big refactors.  Also bear in mind there is an .eslintrc file in the project so try to follow those rules.  This linting will be enforced in the build checks and pull requests will not be merged if they fail checks.
All JavaScript code included in Townsquare should pass (no errors, no warnings)
linting by [ESLint](http://eslint.org/), according to the rules defined in
`.eslintrc` at the root of this repo. To manually check that that is indeed the
case install ESLint and run

```
eslint client/ server/ test/
```

from repository's root.

All tests should also pass.  To run these manually do:

```
npm test
```

If you are making any game engine changes, these will not be accepted without unit tests to cover them.

