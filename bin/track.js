var config = require('./config');
try { 
  var pkg = require('../../../package.json');
  var generators = config.get('generators') || [];
  generators.push(pkg.name);
  config.set('generators',generators);
} catch(e) {}