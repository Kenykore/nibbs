require("dotenv").config();
const testConfig = {
    port: process.env.PORT || 9700,
    node_environment: process.env.ENVIRONMENT,
    database_url: process.env.TEST_DB_URL, 
}

module.exports = testConfig;