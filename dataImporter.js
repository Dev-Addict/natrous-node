const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');

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

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data successfully created');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}