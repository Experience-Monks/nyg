# nyg

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Not another yeoman generator, simplified project generator base around prompts, globs, and events.

## Usage

There are 3 basic things you need to use nyg: prompts (questions to ask before installing), globs (matching all your templates), and the templates themselves.

The prompts are based on [inquirer](https://www.npmjs.com/package/inquirer). Please see the inquirer docs for the full amount of options available to you. These prompted questions get passed to your templates using [markup-js](https://www.npmjs.com/package/markup-js) with the corresponding keys you define as "name".

Here is an example of what you can do.

```js
var prompts = [{
  type: "input",
  name: "author",
  message: "What is your name? (Author)",
  default: "me"
}, {
  type: "confirm",
  name: "owner",
  message: "Is this your project?",
  default: false
}, {
  type: "list",
  message: "What type of project is this?",
  name: "type",
  choices: [{
    name: "Frontend",
    value: "frontend",
    checked: true
  }, {
    name: "Backend",
    value: "backend"
  }]
}];
```

The globs are simply identifiers for your template files. There are 3 properties to each glob base, glob, and output. The base property is the part of the path that will be removed when copied. The glob property is your file globs, it defaults to **/*. The output property is where you want to output the new files, defaults to '' which would be the the current working directory. All these properties get passed through the markup-js templating system as well, so you can use any of your variables within them.

Here is an example of the glob options:

```js
var globs = [
  { base: 'templates/', glob: 'scripts/*' },
  { base: 'templates/style/', output: 'lib/style/' },
  { base: 'templates/{{type}}/', glob: '*' }
];
```

The templates are passed through [markup-js](https://www.npmjs.com/package/markup-js). It is a full featured moustache templating system. Please see the docs for all the things you can do with it.

In its simplist form, this is all you have to do to get the nyg generator running.

```js
var nyg = require('nyg');
nyg(prompts,globs).run();
```

## API



[![NPM](https://nodei.co/npm/nyg.png)](https://www.npmjs.com/package/nyg)

## License

MIT, see [LICENSE.md](http://github.com/Jam3/nyg/blob/master/LICENSE.md) for details.
