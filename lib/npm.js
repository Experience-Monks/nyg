'use strict';
var spawn = require('cross-spawn');
module.exports = function(cwd,cb) {
  var npm = spawn('npm', ['install'], {cwd: cwd, stdio: 'inherit'});
  npm.on('error',function() {
    console.log(arguments);
  });
  npm.on('close',function(code) {
    if (code!==0) console.log(new Error('npm i exited with non-zero code ' + code + '. Please try running "npm i" again as administrator.'));
    cb();
  });
};