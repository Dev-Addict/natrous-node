const User = require('../models/userModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.signUp = catchAsync(
  async (req, res) => {
    const user = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  }
);