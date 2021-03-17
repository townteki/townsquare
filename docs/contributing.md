# Contributing to Townsquare

:+1::tada: Thanks for taking the time to contribute! :tada::+1:

This page contains the information you need to get started with contributing.

## How Can I Contribute?
 * implement cards - pick up any issue that is labeled `card-script`, see [Documentation for implementing cards](https://github.com/townteki/townsquare/blob/master/docs/implementing-cards.md)
 * implement game engine feature - if you want to contribute to the game engine, contact me (mmeldo@gmail.com)
 * implement tests - pick up any issue that is labeled `tests` or if you see any area that is not tested
 * test and report bugs - not yet available as the testing server is still not ready
 * help with the client part - if you want to contribute to the client, contact me (mmeldo@gmail.com)

Feel free to make suggestions, raise pull requests or submit bug reports

If you are going to contribute code, try and follow the style of the existing code as much as possible and talk to me before engaging in any big refactors.  Also bear in mind there is an .eslintrc file in the project so try to follow those rules.  This linting will be enforced in the build checks and pull requests will not be merged if they fail checks.

## Issues
If you encounter any issues on the site or while playing games, please raise an issue with as much detail as possible.

## Development

The game uses [mongodb](https://www.mongodb.com/) as storage so you'll need that installed and running.

```
git clone https://github.com/townsquare/townsquare.git
cd townsquare
git submodule init
git submodule update
npm install
mkdir server/logs
node server/scripts/fetchdata.js
node server/scripts/importstandalonedecks.js
```

If you want to also work on the client, checkout the [Client Repository](https://github.com/mmeldo/townsquare-client) and run.
If you do not need the client source, you can download binaries from [townsquare GDrive](https://drive.google.com/file/d/1MdnDSUBYE1Rl0edYYlHaLC3BcSfwx6-7/view?usp=sharing) and unzip it to the `townsquare` repository.

There are two exectuable components and you'll need to configure/run both to run a local server.  First is the lobby server and then there are game nodes.

```
NODE_ENV=production PORT=4000 node .
node server/gamenode
```

For the lobby server, if you need to override any of the config settings, create a file named config/local.json5

This will get you up and running in development mode.

### Coding Guidelines

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

