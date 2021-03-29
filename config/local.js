/* istanbul ignore file */
require('dotenv').config();
const localConfig = {
  port: process.env.PORT || 9700,
  node_environment: process.env.ENVIRONMENT,
  database_url: process.env.LOCAL_DB_URL,
  frontend_url: process.env.DEV_FRONTEND_URL
};

module.exports = localConfig;
