'use strict';
var path = require('path');
var mkdirp = require('mkdirp');
var EventEmitter = require('events').EventEmitter;
var template = require('./lib/template');
var prompt = require('./lib/prompt');
var npm = require('./lib/npm');
var store = require('./lib/store');
var nyg = function(prompts,globs,options) {
  if (!(this instanceof nyg)) return new nyg(prompts,globs,options);
  this.origin = (module.parent) ? path.dirname(module.parent.filename) : '';
  this.version = require('./package.json').version;
  try { 
    this.generator = require(path.join(this.origin,'package.json')).version;
  } catch(e) { 
    this.generator = "0.0.0";
  }
  if (globs===undefined && options===undefined && !Array.isArray(prompts) && !this._isPrompt(prompts)) {
    options = prompts || {};
    globs = options.globs;
    prompts = options.prompts;
    delete options.prompts;
    delete options.globs;
  }
  this._options = options || {};
  this._prompts = prompts || [];
  this._globs = (globs || []).map(function(cur) {
    cur.base = path.join(this.origin,cur.base);
    return cur;
  }.bind(this));
  // Expose the prompt function and config object for use outside
  this.prompt = prompt;
  this.config = store;
  this._running = false;
  if (this._options.ignore) this.config.set('ignore', this._options.ignore);
  EventEmitter.call(this);
};
nyg.prototype = Object.create(EventEmitter.prototype);
/* Public Functions */
nyg.prototype.run = function() {
  this.cwd = this.cwd || process.cwd();
  this.config.chdir(this.cwd);
  this.config.set('nyg-version',this.version);
  this.config.set('generator-version',this.generator);
  this.config.set('folder',path.basename(this.cwd));

  // write passed in options into config
  // this is useful if you have hardcoded values that maybe
  // generated on initialization
  Object.keys(this._options).forEach(function(key) {
    this.config.set(key, this._options[key]);
  }.bind(this));

  this._tasks = [this._startPrompt.bind(this),this._runPrompt.bind(this),this._startTemplate.bind(this),this._runTemplate.bind(this)];

  // if option npmInstall is set then run npm events
  if(this.config.get('npmInstall') === undefined || this.config.get('npmInstall')) {
    this._tasks.push(this._startInstall.bind(this),this._runInstall.bind(this));
  }
  
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
nyg.prototype.copy = function(input,output,parse,cb) {
  if (typeof parse === 'function') {
    cb = parse;
    parse = true;
  } else {
    parse = parse === false ? false : true;
  }
  output = template.parse(output);
  mkdirp(path.dirname(output),function(err) {
    if (err) throw err;
    if (parse) {
      template.template(path.join(this.origin,template.parse(input)),path.join(this.cwd,output),cb);
    } else {
      template.copy(path.join(this.origin,template.parse(input)),path.join(this.cwd,output),cb);
    }
  }.bind(this));
  return this;
};
nyg.prototype.chdir = function(dir) {
  this.cwd = dir;
  this.config.chdir(dir);
  this.config.set('folder',path.basename(dir));
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
nyg.prototype._isPrompt = function(obj) {
  var validTypes = ['input','confirm','list','rawlist','expand','checkbox','password','editor'];
  return obj.name && obj.type && validTypes.indexOf(obj.type)>-1;
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
nyg.prototype._filterGlobs = function() {
  var data = this.config.getAll();
  var globs = this._globs.map(function(cur) {
    if (typeof cur.when === 'function' && !cur.when(data)) {
      return undefined;
    } else {
      return cur;
    }
  });
  return globs.filter(function(i){return i;});
};
nyg.prototype._runTemplate = function() {
  var doSaveConfig = this.config.get('saveConfig');

  // add in the ability to ask if config file should be saved
  // by default the config file will be saved
  if(doSaveConfig === undefined || doSaveConfig) {
    this.config.save();
  }

  template(this._filterGlobs(this._globs),this.cwd,function() {
    this.emit('postcopy');
    this._next();
  }.bind(this));
};
nyg.prototype._startInstall = function() {
  this.emit('preinstall');
  this._next();
};
nyg.prototype._runInstall = function() {
  npm(this.cwd,function() {
    this.emit('postinstall');
    this._next();
  }.bind(this));
};
module.exports = nyg;
