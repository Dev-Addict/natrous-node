const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(
  async (req, res) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
  });

exports.getTour = catchAsync(
  async (req, res) => {
    const tour = await Tour
      .findOne(
        { name: req.params.tourName.replace(/-/g, ' ') }
      )
      .populate({
        path: 'reviews',
        fields: 'review rating user'
      });
    res.status(200).render('tour', {
      title: req.params.tourName.replace(/-/g, ' '),
      tour
    });
  });

exports.getLoginForm = catchAsync(
  async (req, res) => {
    res.status(200).render('login', {
      title: 'Log In'
    });
  });