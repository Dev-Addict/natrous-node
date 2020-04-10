const Tour = require('../models/tourModel');

exports.getTours = async (req, res) => {
  try {
    const query = { ...req.query };
    const queryExcludedFields = ['page', 'sort', 'limit', 'fields'];
    queryExcludedFields.forEach(el => delete query[el]);
    const queryString = JSON.stringify(query)
      .replace(/\b(gte|gt|lte|lt)\b/g,
        match => `$${match}`);
    let toursQuery = Tour.find(JSON.parse(queryString));
    if (req.query.sort) {
      const sortBy = req.query.sort.replace(/,/g, ' ');
      toursQuery = toursQuery.sort(sortBy);
    } else {
      query.sort('-createdAt');
    }
    if (req.query.fields) {
      const fields = req.query.fields.replace(/,/g, ' ');
      toursQuery = toursQuery.select(fields);
    } else {
      toursQuery = toursQuery.select('-__v');
    }
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const skip = (page - 1) * limit;
    toursQuery = toursQuery.skip(skip).limit(limit);
    const tours = await toursQuery;
    if (req.query.page) {
      const length = await Tour.countDocuments();
      if (skip >= length) {
        throw new Error('We dont have enough data to fit the page');
      }
    }
    res.status(200).json({
      status: 'success',
      results: tours.length,
      page,
      limit,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(201).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: 'updated Tour'
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};