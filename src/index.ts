require('dotenv').config();

import { App } from './app';
import RedisSingleron from './redisSingleton';
import * as mongoose from 'mongoose';

const rs = RedisSingleron.getInstance();

// const startMongo = async () => {
//   console.log();
//   await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
//   console.log();
//   console.log('Successfully connected to mongodb');
// };
// const test = startMongo();
// console.log('TCL: test', test);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

let app = new App().getApp();
export { app };
