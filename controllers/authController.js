const jsonWebToken = require('jsonwebtoken');

const User = require('../models/userModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.signUp = catchAsync(
  async (req, res) => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      photo: req.body.photo,
      password: req.body.password
    });

    const token = jsonWebToken.sign(
      {
        id: user._id
      },
      process.env.JSON_WEB_TOKEN_SECRET,
      {
        expiresIn: process.env.JSON_WEB_TOKEN_TIME
      }
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: 'Because of security causes we can\'t show you the user details'
      }
    });
  }
);