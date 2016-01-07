'use strict';
var inquirer = require("inquirer");
var store = require('./store');
module.exports = function(prompts,cb) {
  prompts.forEach(function(cur,i,arr) {
    if (cur.validate instanceof RegExp) {
      arr[i].validate = cur.validate.test.bind(cur.validate);
    }
  });
  inquirer.prompt(prompts,function(answers) {
    store.setAll(answers);
    store.save();
    cb(answers);
  });
};