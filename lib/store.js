'use strict';
var fs = require('graceful-fs');
var path = require('path');
var name = 'nyg-cfg.json';
var file = path.join(process.cwd(),name);
var store = module.exports = {
  _dirty: false,
  _data: {},
  load: function(cb) {
    fs.readFile(file,'utf8',function(err,data) {
      if (err) throw err;
      store.setAll(JSON.parse(data));
      if (cb) cb();
    });
  },
  chdir: function(dir) {
    file = path.join(dir,name);
  },
  set: function(key,data) {
    store._dirty = true;
    store._data[key] = data;
  },
  del: function(key) {
    store._dirty = true;
    delete store._data[key];
  },
  get: function(key) {
    return store._data[key];
  },
  getAll: function() {
    return store._data;
  },
  setAll: function(obj) {
    Object.keys(obj)
      .forEach(function(key) {
        store.set(key,obj[key]);
      });
  },
  save: function(cb) {
    if (store._dirty) {
      fs.writeFile(file,JSON.stringify(store._data),function(err) {
        if (err) throw err;
        store._dirty = false;
        if (cb) cb();
      });
    } else {
      if (cb) cb();
    }
  }
};