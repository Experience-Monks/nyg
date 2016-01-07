'use strict';
var key = process.argv[2];
var config = require('./config');
var generators = config.get('generators') || {};
var func = generators[key];
if (!func) try { func = require('nyg-'+key); } catch(e) {}
if (!func) try { func = require(key); } catch(e) {}
if (func) {
  func();
} else {
  console.log('No generator found.');
}