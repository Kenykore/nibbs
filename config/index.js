/* istanbul ignore file */
require('dotenv').config();
const development = require('./development');
const staging = require('./staging');
const local= require('./local');
const production = require('./production');
const test= require('./test');
let nodeConfigSetting = {};
const config = {
  email: {

  }
};

const environment = process.env.ENVIRONMENT;

if (environment === 'development') {
  nodeConfigSetting = {...config, ...development};
} else if (environment === 'staging') {
  nodeConfigSetting = {...config, ...staging};
} else if (environment === 'production') {
  nodeConfigSetting = {...config, ...production};
} else if (environment === 'local') {
  nodeConfigSetting = {...config, ...local};
} else if (environment === 'test') {
  nodeConfigSetting = {...config, ...test};
}
module.exports = nodeConfigSetting;
