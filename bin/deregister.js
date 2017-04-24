try { 
  var config = require('./config'); 
  var pkg = require('../../../package.json');
  var generators = config.get('generators') || [];
  var generatorIndex = generators.indexOf(pkg.name);
  if (generatorIndex >= 0) {
    generators.splice(generatorIndex, 1);
    config.set('generators',generators);
  }
} catch(e) {}