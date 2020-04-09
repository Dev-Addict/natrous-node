const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB =
  process.env.DATABASE
    .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con => {
  console.log('Connected to DB successfully.');
}).catch(err => {
  console.log('There is error connecting to DB' + err);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running in port${port}`);
});