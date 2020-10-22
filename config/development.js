require('dotenv').config();
const devConfig = {
  port: process.env.PORT || 9700,
  node_environment: process.env.ENVIRONMENT,
  database_url: process.env.DEV_DB_URL,
};

module.exports = devConfig;
