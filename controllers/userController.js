const User = require('../models/userModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getUsers = catchAsync(
  async (req, res) => {
    const features =
      new APIFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const users = await features.query;
    res.status(200).json({
      status: 'success',
      results: users.length,
      page: features.queryString.page * 1 || 1,
      limit: features.queryString.limit * 1 || 10,
      data: {
        users
      }
    });
  }
);

exports.createUser = factory.createOne(User);

exports.getUser = catchAsync(
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('No tour found with this ID', 404);
    }
    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  }
);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);