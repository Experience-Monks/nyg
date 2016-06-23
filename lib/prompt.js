'use strict';
var inquirer = require("inquirer");
var store = require('./store');

var acceptDefaults = process.argv.reduce(function(accept, arg) {
  return arg === '-y' || arg === '--yes' || accept;
}, false);


function set(answers, cb) {
  store.setAll(answers);
  cb(answers);
}

module.exports = function(prompts,cb) {
  if (!Array.isArray(prompts)) prompts = [prompts];

  if(acceptDefaults) {
    var answers = prompts.reduce(function(collector, prompt) {
      if(prompt.choices) {
        collector[prompt.name] = prompt.choices.reduce(function(defaultOpt, choice) {
          return choice.checked ? choice.value : defaultOpt;
        }, null);
      } else {
        collector[prompt.name] = prompt.default;
      }

      return collector
    }, {});

    set(answers, cb);
  } else {
    prompts.forEach(function(cur,i,arr) {
      if (cur.validate instanceof RegExp) {
        arr[i].validate = cur.validate.test.bind(cur.validate);
      }
    });

    inquirer.prompt(prompts,function(answers) {
      set(answers, cb);
    });
  }
};
