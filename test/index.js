var log = function(type) {
  console.log(type);
};

var rf = require('rimraf');
var mkdirp = require('mkdirp');
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
var globs = [
  {base: 'template/', glob: '*'},
  {base: 'template/{{option}}', glob: '*'},
  {base: 'template/parser/', glob: '*', template: false }
 ];

rf('test/output/*',function() {
  mkdirp('test/output',function() {
    process.chdir('test/output');
    var gen = nyg(prompts,globs);
    gen.on('preprompt',log.bind(null,'preprompt'));
    gen.on('postprompt',log.bind(null,'postprompt'));
    gen.on('precopy',log.bind(null,'precopy'));
    gen.on('postcopy',function() {
      log('postcopy');
      var done = gen.end();
      gen.copy('template/parser/parser.txt','copy-parsed.txt',function() {
        gen.copy('template/parser/parser.txt','copy-unparsed.txt',false,function() {
          if (!gen.config.get('npm')) {
            gen.end();
          } else {
            done();
          }
        });
      });
      
    });
    gen.on('preinstall',log.bind(null,'preinstall'));
    gen.on('postinstall',log.bind(null,'postinstall'));
    gen.run();
  });
});