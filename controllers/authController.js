const jsonWebToken = require('jsonwebtoken');
const validator = require('validator');

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
      token,
      data: {
        user: 'No User Data Leak Policy'
      }
    });
  }
);

exports.signIn = catchAsync(async (req, res) => {
  const {email, password} = req.body;
  if (
    !email ||
    !password ||
    !validator.isEmail(email) ||
    password.length < 8 ||
    password.length > 100) {
    throw new AppError('request body should have valid email and password.', 400);
  }
  const user = await User.find({email, password});
  const token = jsonWebToken.sign(
    {
      id: user._id
    },
    process.env.JSON_WEB_TOKEN_SECRET,
    {
      expiresIn: process.env.JSON_WEB_TOKEN_TIME
    }
  );
  res.status(200).json({
    status: 'success',
    token
  });
});