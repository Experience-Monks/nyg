'use strict';
var fs = require('graceful-fs');
var path = require('path');
var mkdirp = require('mkdirp');
var glob = require('glob');
var Mark = require('markup-js');
var store = require('./store');
var template = module.exports = function(inputs,output,cb) {
  if (!Array.isArray(inputs)) inputs = [inputs];
  var count = 0;
  inputs.forEach(function(input) {
    input.base = template.parse(input.base);
    glob(path.join(input.base,input.glob || '**/*'),{nodir: true, dot: true},function(input,err,files) {
      if (err) throw err;
      copyFiles(files,input.base,path.join(output,(input.output || '')),function() {
        count++;
        if (cb && count>=inputs.length) cb();
      });
    }.bind(null,input));
  });
};

template.copy = function(input,output,cb) {
  fs.readFile(input,'utf8',function(err,str) {
    if (err) throw err;
    fs.writeFile(template.parse(output),template.parse(str),function(err) {
      if (err) throw err;
      cb();
    });
  })
};

template.parse = function(string) {
  return Mark.up(string,store.getAll());
};

function copyFiles(files,base,output,cb) {
  var count = 0;
  if (files.length>0) {
    files.forEach(function(cur) {
      var out = path.join(output,path.normalize(cur).replace(base,''));
      mkdirp(path.dirname(out),function(err) {
        if (err) throw err;
        template.copy(cur,out,function() {
          count++;
          if (cb && count>=files.length) cb();
        });
      });
    });
  } else {
    if (cb) cb();
  }
};