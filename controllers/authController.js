const crypto = require('crypto');
const { promisify } = require('util');
const jsonWebToken = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

const signToken = ({ _id }) => {
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
  const { email, password } = req.body;
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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new AppError('You are not logged in.', 401);
  }
  const decodedToken = await promisify(jsonWebToken.verify)(token, process.env.JSON_WEB_TOKEN_SECRET);
  const user = await User.findById(decodedToken.id);
  if (!user) {
    throw new AppError(
      'The user belong to the token that no longer exists',
      401
    );
  }
  if (user.isPasswordChanged(decodedToken.iat)) {
    throw new AppError(
      'The user has changed the password pls create new token',
      401
    );
  }
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync((req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new AppError('You don\'t have permission to do that', 403);
      }
      next();
    }
  );
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
      throw new AppError('wrong Email address', 404);
    }
    const resetToken = user.createResetPasswordToken();
    await user.save({
      validateBeforeSave: false
    });
    const resetURL =
      `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Go to ${resetURL} to reset your password`;
    await sendEmail({
      email: user.email,
      subject: 'Reset password (valid for 10 minutes)',
      message
    }).catch(async err => {
      await user.save({
        validateBeforeSave: false
      });
      throw new AppError('failed to send the email', 500);
    });

    res.status(200).json({
      status: 'success',
      message: 'we sent the email'
    });
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    const hashedToken =
      crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');
    const user = await User.find({
      passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now()}
    });
    if (!user) {
      throw new AppError('Token is invalid or expired', 400);
    }
    user.password = request.body.password;
    await user.save();

    const token = signToken(user);

    res.status(200).json({
      status: 'success',
      token
    });
  }
);

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');

  if (!user || !(await user.correctPassword(req.body.password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = signToken(user);

  res.status(200).json({
    status: 'success',
    token
  });
});