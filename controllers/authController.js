const jsonWebToken = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = ({_id}) => {
  return jsonWebToken.sign(
    {
      id: _id
    },
    process.env.JSON_WEB_TOKEN_SECRET,
    {
      expiresIn: process.env.JSON_WEB_TOKEN_TIME
    }
  );
};

exports.signUp = catchAsync(
  async (req, res) => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      photo: req.body.photo,
      password: req.body.password
    });

    const token = signToken(user);

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
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  const token = signToken(user);

  res.status(200).json({
    status: 'success',
    token
  });
});