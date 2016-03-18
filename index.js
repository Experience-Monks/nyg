'use strict';
var path = require('path');
var mkdirp = require('mkdirp');
var EventEmitter = require('events').EventEmitter;
var template = require('./lib/template');
var prompt = require('./lib/prompt');
var npm = require('./lib/npm');
var store = require('./lib/store');
var nyg = function(prompts,globs) {
  if (!(this instanceof nyg)) return new nyg(prompts,globs);
  this.origin = (module.parent) ? path.dirname(module.parent.filename) : '';
  this._prompts = prompts;
  this._globs = globs.map(function(cur) {
    cur.base = path.join(this.origin,cur.base);
    return cur;
  }.bind(this));
  // Expose the prompt function and config object for use outside
  this.prompt = prompt;
  this.config = store;
  this._running = false;
  EventEmitter.call(this);
};
nyg.prototype = Object.create(EventEmitter.prototype);
/* Public Functions */
nyg.prototype.run = function() {
  this.cwd = process.cwd();
  this.config.set('folder',path.basename(this.cwd));
  this._tasks = [this._startPrompt.bind(this),this._runPrompt.bind(this),this._startTemplate.bind(this),this._runTemplate.bind(this),this._startInstall.bind(this),this._runInstall.bind(this)];
  this._running = true;
  process.nextTick(this._next.bind(this));
  return this;
};
nyg.prototype.async = function() {
  this._running = false;
  return this._resume.bind(this);
};
nyg.prototype.end = function() {
  this._tasks = [];
  this._running = false;
  this.emit('complete');
  return this;
};
nyg.prototype.copy = function(input,output,cb) {
  output = template.parse(output);
  mkdirp(path.dirname(output),function(err) {
    if (err) throw err;
    template.copy(path.join(this.origin,template.parse(input)),path.join(this.cwd,output),cb);
  }.bind(this));
  return this;
};
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
nyg.prototype._startPrompt = function() {
  this.emit('preprompt');
  this._next();
};
nyg.prototype._runPrompt = function() {
  prompt(this._prompts,function() {
    this.emit('postprompt');
    this._next();
  }.bind(this));
};
nyg.prototype._startTemplate = function() {
  this.emit('precopy');
  this._next();
};
nyg.prototype._runTemplate = function() {
  template(this._globs,this.cwd,function() {
    this.emit('postcopy');
    this._next();
  }.bind(this));
};
nyg.prototype._startInstall = function() {
  this.emit('preinstall');
  this._next();
};
nyg.prototype._runInstall = function() {
  this.emit('preinstall');
  npm(this.cwd,function() {
    this.emit('postinstall');
    this._next();
  }.bind(this));
};
module.exports = nyg;
