// var prompts = [{
//   type: "input",
//   name: "projectAuthor",
//   message: "What is your name? (Author)",
//   default: "Jam3"
// }, {
//   type: "input",
//   name: "projectAuthorEmail",
//   message: "What is your email? (Author Email)",
//   default: "td@jam3.com"
// }, {
//   type: "input",
//   name: "projectDescription",
//   message: "Describe the project:",
//   default: "A Jam3 project"
// }, {
//   type: "input",
//   name: "projectRepository",
//   message: "What is your git repository? (GitHub Repository)",
//   default: ""
// }, {
//   type: "confirm",
//   name: "changeFileNaming",
//   message: "Would you perfer Landing/Landing.js over Landing/index.js?",
//   default: false
// }, {
//   type: "confirm",
//   name: "useES6",
//   message: "Would you like to use ES6?",
//   default: false
// }, {
//   type: "confirm",
//   name: "useTexturePackager",
//   message: "Would you like to use TexturePacker? (Beta)",
//   default: false
// }, {
//   type: "checkbox",
//   message: "What will your project use?",
//   name: "baseSelector",
//   choices: [{
//     name: "DOM",
//     value: "dom",
//     checked: true
//   }, {
//     name: "CANVAS",
//     value: "canvas"
//   }]
// },{
//   type: "list",
//   message: "What css preprocessor will your project use?",
//   name: "css",
//   choices: [{
//     name: "SCSS",
//     value: "scss",
//     checked: true
//   },{
//     name: "LESS",
//     value: "less"
//   }]
// }];

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
