const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getReviews = catchAsync(
  async (req, res, next) => {
    let filter;
    if (req.params.tourId) {
      filter = {
        tour: req.params.tourId
      }
    }
    const features =
      new APIFeatures(Review.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const reviews = await features.query;
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      page: features.queryString.page * 1 || 1,
      limit: features.queryString.limit * 1 || 20,
      data: {
        reviews
      }
    });
  });

exports.getReview = catchAsync(
  async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError('No Review found with this ID', 404);
    }
    res.status(201).json({
      status: 'success',
      data: {
        review
      }
    });
  }
);

exports.setInitialData = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);