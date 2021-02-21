# Townsquare

Web based implementation of Doomtown: Reloaded

## About

Similarly as ringteki, this is based on the throneteki and uses large parts of the source. This is work in progress.

Townsquare is a fork of the throneteki sourcecode.

Below is old readme from throneteki. Deployment is the same, so I am keeping it for now.
## Contributing

The code is written in node.js(server) and react.js(client).  Feel free to make suggestions, implement new cards, refactor bits of the code that are a bit clunky(there's a few of those atm), raise pull requests or submit bug reports

If you are going to contribute code, try and follow the style of the existing code as much as possible and talk to me before engaging in any big refactors.  Also bear in mind there is an .eslintrc file in the project so try to follow those rules.  This linting will be enforced in the build checks and pull requests will not be merged if they fail checks.

[Documentation for implementing cards](https://github.com/townsquare/townsquare/blob/master/docs/implementing-cards.md)

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
NODE_ENV=production PORT=4000 node .
node server/gamenode
```

Since there is no client to fetch, you will have to checkout the [Client Repository](https://github.com/townsquare/townsquare-client) and run.
To import data and images, go to [townsquare Gdrive](https://drive.google.com/drive/folders/19m9CmWzd-zfUz7ujv8LXX96TmROKjjzM?usp=sharing) and download all json files plus cards.zip

Use json files to import data to the MongoDB:
 - create `townsquare` DB
 - create collections `cards`, `packs` and `decks` under the townsquare DB
 - import data to the three collections from their respective jsons (townsquare.cards.json goes to the cards collection and so on)
Unzip the cards.zip image archive into the townsquare-client you checked out. It should go to the `assets\img` folder, so the path containing images should look like `townsquare-client\assets\img\cards` after unpacking.

There are two exectuable components and you'll need to configure/run both to run a local server.  First is the lobby server and then there are game nodes.

For the lobby server, if you need to override any of the config settings, create a file named config/local.json5

This will get you up and running in development mode.

For production:

```
NODE_ENV=production PORT=4000 node .
```

Then for each game node (typically one per CPU/core):

```
PORT={port} SERVER={node-name} node server/gamenode
```

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
