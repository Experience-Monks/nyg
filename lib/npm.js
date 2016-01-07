'use strict';
var exec = require('child_process').spawn;
module.exports = function(cb) {
  var npm = spawn('npm', ['install']);
  npm.on('close',function(code) {
    cb();
  });
};