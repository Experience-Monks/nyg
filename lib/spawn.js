'use strict';
var spawn = require('cross-spawn');
module.exports = function(command,args,cwd,cb) {
  var child = spawn(command, args, {cwd: cwd, stdio: 'inherit'});
  child.on('error',function() {
    console.log(arguments);
  });
  child.on('close',function(code) {
    if (code!==0) console.log(new Error(command + ' exited with non-zero code ' + code + '. Please try running "' + command + '" again as administrator.'));
    if (cb) cb();
  });
};