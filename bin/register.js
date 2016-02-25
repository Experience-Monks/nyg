var config = require('./config'); 
try {
  var pkg = require('../../../package.json');
  var generators = config.get('generators') || [];
  if (generators.indexOf(pkg.name)<0) generators.push(pkg.name);
  config.set('generators',generators);
} catch(e) {}