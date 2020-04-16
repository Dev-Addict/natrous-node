const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getReviews = catchAsync(
  async (req, res, next) => {
    const features =
      new APIFeatures(Review.find(), req.query)
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

exports.createTour = catchAsync(
  async (req, res) => {
    const review = await Review.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: review
      }
    });
  }
);

exports.updateReview = catchAsync(
  async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  }
);

exports.deleteReview = catchAsync(
  async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);