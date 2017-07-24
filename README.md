# nyg

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Not another yeoman generator, simplified project generator base around prompts, globs, and events.

## Usage

[![NPM](https://nodei.co/npm/nyg.png)](https://www.npmjs.com/package/nyg)

There are 3 basic things you need to use nyg: prompts (questions to ask before installing), globs (matching all your templates), and the templates themselves.

The prompts are based on [inquirer](https://www.npmjs.com/package/inquirer). Please see the inquirer docs for the full amount of options available to you. These prompted questions get passed to your templates using [handlebars](https://www.npmjs.com/package/handlebars) with the corresponding keys you define as "name".

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
},
{
  type: "list",
  name: "language",
  message: "What backend language are your using?",
  choices: [{
    name: "PHP",
    value: "php",
    checked: true
  }, {
    name: "Python",
    value: "python"
  }, {
    name: "Node",
    value: "node"
  }]
  when: function(answers) { return answers.type === "backend"; }
}];
```

The globs are simply identifiers for your template files. There are 3 properties to each glob base, glob, and output. The base property is the part of the path that will be removed when copied. The glob property is your file globs, it defaults to **/*. The output property is where you want to output the new files, defaults to '' which would be the the current working directory. All these properties get passed through the [handlebars](https://www.npmjs.com/package/handlebars) template system as well, so you can use any of your variables within them.

Here is an example of the glob options:

```js
var globs = [
  { base: 'templates/', glob: 'scripts/*' },
  { base: 'templates/style/', output: 'lib/style/', template: false },
  { base: 'templates/{{type}}/', glob: '*' }
];
```

The templates are passed through [handlebars](https://www.npmjs.com/package/handlebars)). It is a full featured moustache template system. Please see the docs for all the things you can do with it. If you do not want to run the file contents through handlebars, simply pass `template: false` with the glob object. This defaults to `true`, so you will have to pass it in for every glob object you do not want parsed. It will still parse the input and output paths however, just not file contents.

In its simplest form, this is all you have to do to get the nyg generator running.

```js
var nyg = require('nyg');
nyg(prompts,globs).run();
```

When running the actual generator, simply follow these steps:

```bash
npm i nyg -g
npm i your-generator -g
cd your/project/directory
nyg your-generator
```

## Command line interface

Details for `nyg` command-line interface

Usage:  
```nyg [opts]```  

Options:  
  ```--list, -l```  show list of available generators  
  ```--version, -v```  show version of nyg  
  ```[generator] --version, -v```  show version of nyg and nyg-generator  
  ```[generator] --debug, -d```  displays any errors that occur when running a generator  

## API

### `nyg(prompts,globs,[options])`

The main entry point to nyg. Returns an nyg instance.

```prompts``` a single questions or an array of questions to ask the user, using [inquirer](https://www.npmjs.com/package/inquirer) syntax.  
```globs``` a single glob or an array of globs specifying which files to copy and to where.  Globs also include the `when` property in the same way prompts do, this allows you to enable / disable globs based on prompt results.
```options``` an optional object which can be passed in. These options will be merged in with data gathered via `prompts`. This can be useful if for instance you want to template in a Date or some other hardcoded value. You can also pass in:
- `saveConfig` - which if set to `false` will ensure that the `nyg-cfg.json` 
will not be written.
- `npmInstall` - if set to false then `npm install` will not be called.
- `ignore` - A list of file extensions and / or file names the handlebars templating engine will ignore.

These parameters can also be passed in as a single object to nyg. `prompts` and `globs` are reserved keywords in this object but everything else will be treated as the options parameter.

```js
nyg({
  prompts: prompts,
  globs: globs,
  saveConfig: false,
  npmInstall: false,
  ignore: ['.txt']
})
```

### `nyg.run()`

Starts the generator.

### `nyg.chdir(dir)`

Changes the current working directory, be sure to run this before the copy phase. Simply pass in the directory as a string.

### `nyg.on(event,function)`

nyg extends an event emitter so all event emitter functions are exposed, although ```on``` will be the on you primarily use. Please see the [EventEmitter](https://nodejs.org/api/events.html) for further information.

```event``` the event name.  
```function``` the function to call when the event is emitted.  

### `nyg.async()`

Stops the generator at its current step and returns a function to call when you would like to resume it. This is useful if you want to perform some asynchronous functions between steps. You can call this function to stop the generator in any event.
```js
var gen = nyg(prompts,globs);
gen.on('postprompt',function() {
  // pause the generator after prompting is complete
  var done = gen.async();
  setTimeout(function() {
    // resume the generator after performing some actions
    done();
  },1000)
});
```

### `nyg.end()`

Stops the generator, only call this if you want to cancel the generator prematurely, such as skipping the install step. This does not cancel an action if it is currently running, only prevents it from going to the next step.

### `nyg.prompt(prompt,callback)`

Exposes the prompt function for use outside the generator, follows the same syntax as the constructor.

```prompt``` A single prompt or an array of prompts.  
```callback``` a function to call when the prompting is done, returns an object with the user values assigned to the keys you defined.  

### `nyg.copy(input,output,[parse],callback)`

Exposes the copy function for use outside the generator, input, output, and the content of input will be run through the template engine. Send `false` as the third parameter if you do not wish the content to be run through the template engine. 

```input``` the input file.  
```output``` where to write the input file after it has been through the template engine.  
```[parse]``` Optional parameter, pass false if you do not want the content to be run through the template engine.  
```callback``` a function to call once the file has been written.

### `nyg.config`

Exposes the configuration object for use outside the generator. This object gets sent to all the templates so you can manually manipulate the values if you would like. The answers from the prompts automatically get set in this object.

### `nyg.config.del(key)`

Removes the value specified via ```key```.

### `nyg.config.set(key,value)`

Sets a new ```value``` specified via ```key```, this will overwrite whatever is already defined by that key.

### `nyg.config.get(key)`

Returns the value specified via ```key```.

## Events

nyg is an event emitter and will emit multiple events for you to react upon.

```preprompt``` emitted before any prompting has happened.  
```postprompt``` emitted after prompts have been answered by the user.  
```precopy``` emitted before any files get run through the template engine and outputted.  
```postcopy``` emitted after all the copying has been completed.  
```preinstall``` emitted before ```npm install``` has run.  
```postinstall``` emitted once npm has finished installing.

## Handlebars

Our handlebars setup also includes a string comparison helper #is which functions much like a regular if statemeent. He is an example:

```
{{#is NODE_ENV 'production'}}
This will only be shown if the node environment is production
{{/is}}
```

If there are any other helpers you would like to see added, please feel free to create a github issue.

## Test

Running ```npm test``` will output the generator at ```test/index.js``` to the output folder. Please review ```test/index.js``` for a bare bones generator setup.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/nyg/blob/master/LICENSE.md) for details.
