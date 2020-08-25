require('dotenv').config();
const config = require('./config/index');
const app=require('./app');
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`${config.node_environment} server started, listening on port ${PORT}`);
});
