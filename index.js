'use strict';
var path = require('path')
var EventEmitter = require('events').EventEmitter;
var template = require('./lib/template');
var prompt = require('./lib/prompt');
var npm = require('./lib/npm');
var store = require('./lib/store');
var nyg = function(prompts,globs) {
  if (!(this instanceof nyg)) return new nyg(prompts,globs);
  var origin = (module.parent) ? path.dirname(module.parent.filename) : '';
  this._prompts = prompts;
  this._globs = globs.map(function(cur) {
    cur.base = path.join(origin,cur.base);
    return cur;
  });
  // Expose the copy function and config object for use outside
  this.config = store;
  this._running = false;
  EventEmitter.call(this);
};
nyg.prototype = Object.create(EventEmitter.prototype);
/* Public Functions */
nyg.prototype.run = function() {
  this._tasks = [this._runPrompts.bind(this),this._runTemplate.bind(this),this._runInstall.bind(this)];
  this._running = true;
  this._next();
};
nyg.prototype.async = function() {
  this._running = false;
  return this.prototype._resume;
};
nyg.prototype.end = function() {
  this._tasks = [];
  this._running = false;
  this.emit('complete');
};
nyg.prototype.copy = function(input,output,cb) {
  template.copy(input,path.join(process.cwd(),output),cb);
}
/* Private Functions */
nyg.prototype._resume = function() {
  this._running = true;
  this._next();
};
nyg.prototype._next = function() {
  if (!this._running) return;
  if (this._tasks.length>0) {
    var task = this._tasks.shift();
    task();
  } else {
    this.end();
  }
};
nyg.prototype._runPrompts = function() {
  this.emit('preprompt');
  prompt(this._prompts,function() {
    this.emit('postprompt');
    this._next();
  }.bind(this));
};
nyg.prototype._runTemplate = function() {
  this.emit('precopy');
  template(this._globs,process.cwd(),function() {
    this.emit('postcopy');
    this._next();
  });
};
nyg.prototype._runInstall = function() {
  this.emit('preinstall');
  npm(function() {
    this.emit('postinstall');
    this._next();
  });
};
module.exports = nyg;
