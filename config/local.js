require('dotenv').config();
const localConfig = {
  port: process.env.PORT || 9700,
  node_environment: process.env.ENVIRONMENT,
  database_url: process.env.LOCAL_DB_URL,
};

module.exports = localConfig;
