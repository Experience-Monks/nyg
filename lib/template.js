'use strict';
var fs = require('graceful-fs');
var path = require('path');
var mkdirp = require('mkdirp');
var glob = require('glob');
var isBinaryFile = require('isbinaryfile');
var render = require('./render');
var store = require('./store');
var template = module.exports = function(inputs,output,cb) {
  if (!Array.isArray(inputs)) inputs = [inputs];
  if (inputs.length>0) {
    var count = 0;
    inputs.forEach(function(input) {
      input.base = parsePath(input.base);
      if (input.output) input.output = parsePath(input.output);
      glob(path.join(input.base,input.glob || '**/*'),{nodir: true, dot: true},function(input,err,files) {
        if (err) throw err;
        copyFiles(files,input.base,path.join(output,(input.output || '')),input.template===false ? false : true,function() {
          count++;
          if (cb && count>=inputs.length) cb();
        });
      }.bind(null,input));
    });
  } else {
    cb();
  }
};

template.template = function(input,output,cb) {
  // check whether the file exists. If it does not then template
  fs.exists(output, function(exists) {
    if(!exists) {
      fs.readFile(input,'utf8',function(err,str) {
        if (err) throw err;
        fs.writeFile(parsePath(output),template.parse(str),function(err) {
          if (err) throw err;
          cb();
        });
      });
    } else {
      cb();
    }
  });
};

template.copy = function(input,output,cb) {
  // check whether the file exists. If it does not then copy
  fs.exists(output, function(exists) {
    if(!exists) {
      var write = fs.createWriteStream(parsePath(output));
      write.on('finish',cb);
      fs.createReadStream(input).pipe(write);
    } else {
      cb();
    }
  });
};

template.parse = function(string) {
  return render(string,store.getAll());
};

function parsePath(path) {
  var arr = path.split('\\').map(function(cur) {
    return template.parse(cur);
  });
  return arr.join('\\');
}

function checkIgnore(file) {
  var ignore = store.get('ignore') || [];
  if (!Array.isArray(ignore)) ignore = [ignore];
  return ignore.some(function(path) {
    return file.indexOf(path) >= 0;
  });
}

function copyFiles(files,base,output,parse,cb) {
  
  var count = 0;
  if (files.length>0) {
    files.forEach(function(cur) {
      var out = path.join(output,path.normalize(cur).replace(base,''));
      mkdirp(path.dirname(out),function(err) {
        if (err) throw err;
        var done = function() {
          count++;
          if (cb && count>=files.length) cb();
        };
        if (parse && !checkIgnore(cur)) {
          isBinaryFile(cur,function(err,result) {
            if (result) {
              template.copy(cur,out,done);
            } else {
              template.template(cur,out,done);
            }
          })
        } else {
          template.copy(cur,out,done);
        }
      });
    });
  } else {
    if (cb) cb();
  }
};