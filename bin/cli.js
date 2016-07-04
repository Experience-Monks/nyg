#!/usr/bin/env node
'use strict';
var key = process.argv[2];
var debug = process.argv.length > 3 && (process.argv.indexOf('-d') >= 0 || process.argv.indexOf('--debug') >= 0);

if (!key) key = '-l';
if (key === '--list' || key === '-l') {
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
} else if (key === '--version' || key === '-v') {
  printVersion(process.argv[3]);
} else if (process.argv[3] === '-v' || process.argv[3] === '--version') {
  printVersion(key);
} else {
  runGenerator(key);
}

function printVersion(key) {
  var nygPackageJson = require('../package.json');
  console.log('nyg version:', nygPackageJson && nygPackageJson.version);

  if(key) {
    var genPackageJson;
    var path = key + '/package.json';
    try {
      genPackageJson = require(path);
    } catch(e) {
      printError(e);

      try {
        key = 'nyg-' + key;
        genPackageJson = require('nyg-' + path);
      } catch(e) {printError(e);}
    }

    if (genPackageJson) {
      console.log(key + ' version: ' + genPackageJson.version);
    }
  }
}

function runGenerator(key) {
  var func;
  var notFound1;
  var notFound2;
  if (!func) try { func = require(key); } catch(e) { notFound1 = moduleFound(e); }
  if (!func) try { func = require('nyg-'+key); } catch(e) { notFound2 = moduleFound(e); } 
  if (typeof func === 'function') {
    func();
  }
  if (notFound1 && notFound2) console.error('generator',key,'not found.');
}

function moduleFound(e){
  if (e.code && e.code=='MODULE_NOT_FOUND') {
    return true;
  } else {
    if (debug) console.error(e);
    return false;
  }
}