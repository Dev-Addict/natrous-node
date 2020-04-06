const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    results: tours.length,
    data: { tours }
  });
};

const getTour = (req, res) => {
  const tour = tours.find(el => el.id === req.params.id * 1);

  if (tour) {
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        tour
      }
    });
  } else {
    res.status(404).json({
      status: 'fail',
      requestTime: req.requestTime,
      message: 'Invalid ID'
    });
  }
};

const createTour = (req, res) => {
  const id = tours[tours.length - 1];
  const tour = Object.assign({ id }, req.body);

  tours.push(tour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        tour
      }
    });
  });
};

const updateTour = (req, res) => {
  const prevTour = tours.find(el => el.id === req.params.id * 1);
  const tour = Object.assign(prevTour, req.body);
  let newTours = [];
  for (let i = 0; i < tours.length; i++) {
    if (tours[i].id !== req.params.id * 1) {
      newTours.push(tours[i]);
    }
  }

  newTours.push(tour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(newTours), err => {
    res.status(204).json({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        tour
      }
    });
  });
};

const deleteTour = (req, res) => {
  let newTours = [];
  for (let i = 0; i < tours.length; i++) {
    if (tours[i].id !== req.params.id * 1) {
      newTours.push(tours[i]);
    }
  }
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(newTours), err => {
    res.status(204).json({
      status: 'success',
      requestTime: req.requestTime,
      data: null
    });
  });
};

app
  .route('/api/v1/tours')
  .get(getTours)
  .post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App is running in port${port}`);
});