require('dotenv').config();
const config = require('./config/index');
const app=require('./app');
const PORT = config.port;
const mongoose= require('mongoose');
const databaseConfig = require('./config/index.js');
// configuration
// 1. Database Connection
mongoose.connect(databaseConfig.database_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const db= mongoose.connection;
// db.dropCollection('orders')
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', (()=>{
  console.log('connected to db');
}));
app.listen(PORT, () => {
  console.log(`${config.node_environment} server started, listening on port ${PORT}`);
});
