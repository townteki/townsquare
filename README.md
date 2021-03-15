# Townsquare

Web based implementation of Doomtown: Reloaded

## About

Similarly as ringteki, this is based on the throneteki and uses large parts of the source. 
Townsquare is a fork of the throneteki sourcecode.

![work-in-progress-wip](https://user-images.githubusercontent.com/10244559/111221193-752a4000-85da-11eb-9aff-0b6ae7ff7ca2.png)

This client is work in progress

## Contributing

The code is written in node.js(server) and react.js(client).  
You can check the current state of the project here(link to the wiki).

If you want to contribute, there are few options for you:
- implement cards - pick up any issue that is labeled `card-script`, see [Documentation for implementing cards](https://github.com/townsquare/townsquare/blob/master/docs/implementing-cards.md)
- implement tests - pick up any issue that is labeled `tests` or if you see any area that is not tested
- test current implementation - not yet available as the testing server is still not ready
- implement game engine feature - if you want to contribute to the game engine, contact mmeldo@gmail.com
- help with the client part - if you want to contribute to the client, contact mmeldo@gmail.com

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
To 


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
