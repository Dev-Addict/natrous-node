const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const tour = tours.find(el => el.id === req.params.id * 1);

  if (tour) {
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } else {
      res.status(404).json({
          status: 'fail',
          message: 'Invalid ID'
      });
  }
});

app.post('/api/v1/tours', (req, res) => {
  const id = tours[tours.length - 1];
  const tour = Object.assign({ id }, req.body);

  tours.push(tour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'success',
      data: {
        tour
      }
    });
  });
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
            data: {
                tour
            }
        });
    });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App is running in port${port}`);
});