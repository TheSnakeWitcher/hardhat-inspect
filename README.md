# Hardhat-inspect


A plugin to conveniently inspect some data of a [hardhat](https://hardhat.org)  project 


## Installation


To install run

```bash
pnpm hardhat-inspect -D
```

Import the plugin in your `hardhat.config.ts`:

```ts
import "hardhat-inspect";
```

Or if you are not using TypeScript, in your `hardhat.config.js`:

```js
require("hardhat-inspect");
```


## Tasks


This plugin creates no additional tasks, only overrides the default `compile` task to export
conveniently some data after compilation.


## Environment extensions


Adds a `inspect` field to `hre` with type `Inspector` .


## Configuration


This plugin extend `hre.config.paths` with an optional field `data` where all data that `hardhat-inspect` find 
is saved, by default it use a `data` directory in the project root.


## Usage


To use you can import the data that you need conveniently from the json files in the configured `data` path
or call to `await hre.inspect.refresh()` and then access all data directly from `hre.inspect.{data-of-interest}`
where `{data-of-interest}` could be `contractNames`, `errors` or `events`.
