var nyg = require('../');
var prompts = [
  {
    type: "input",
    name: "project",
    message: "What is the project name? (nyg-*)",
    validate: /nyg-.*\w+/g,
    default: "nyg-test"
  },{
    type: "list",
    message: "What option?",
    name: "option",
    choices: [{
      name: "Option 1",
      value: "option1",
      checked: true
    },{
      name: "Option 2",
      value: "option2"
    }]
  },
  {
    type: "confirm",
    message: "run npm install?",
    name: "npm",
    default: false
  }
];
var globs = [{glob: '*', base: 'template/'},{base: 'template/{{option}}', glob: '*'}];
var gen = nyg(prompts,globs);
gen.on('preprompt',console.log);
gen.on('postprompt',console.log);
gen.on('precopy',console.log);
gen.on('postcopy',function() {
  if (!gen.config.get('npm')) gen.end();
});
gen.on('preinstall',console.log);
gen.on('postinstall',console.log);
gen.run();
