#!/usr/bin/env node
'use strict';
var key = process.argv[2];
if (key==='--list') {
  var config = require('./config');
  var generators = config.get('generators') || [];
  if (generators.length>0) {
    var inquirer = require('inquirer');
    var list = {
      type: "list",
      message: "What generator will you use.",
      name: "key"
    };
    list.choices = generators.map(function(cur) {
      return {name: cur, value: cur};
    });
    list.choices.push({name: 'exit', value: 'exit'});
    inquirer.prompt(list,function(answer) {
      if (answer.key!='exit') runGenerator(answer.key);
    });
  } else {
    console.log('No generators installed.')
  }
} else {
  runGenerator(key);
}

function runGenerator(key) {
  var func;
  if (!func) try { func = require(key); } catch(e) {}
  if (!func) try { func = require('nyg-'+key); } catch(e) {}
  if (func) {
    func();
  } else {
    console.log('Generator',key,'not installed.');
  }
}