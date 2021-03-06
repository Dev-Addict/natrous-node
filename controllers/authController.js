const crypto = require('crypto');
const { promisify } = require('util');
const jsonWebToken = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Email = require('../utils/Email');

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

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(
  async (req, res) => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      photo: req.body.photo,
      password: req.body.password
    });
    const url = `${req.protocol}://${req.get('host')}`;
    await new Email(user, url).sendWelcome();

    sendToken(user, 201, res);
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


  sendToken(user, 200, res);
});

exports.logOut = catchAsync((req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(),
    httpOnly: true
  });
  res.status(200).json({status:'success'})
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

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
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new AppError('wrong Email address', 404);
    }
    const resetToken = user.createResetPasswordToken();
    await user.save({
      validateBeforeSave: false
    });
    const resetURL =
      `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

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
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
      throw new AppError('Token is invalid or expired', 400);
    }
    user.password = request.body.password;
    await user.save();


    sendToken(user, 200, res);
  }
);

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');

  if (!user || !(await user.correctPassword(req.body.password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.email || req.body.role) {
    throw new AppError(
      'You can\'t change your password or email or role using this route',
      400
    );
  }

  const updateDetail = req.body;
  if (req.body.photo) {
    updateDetail.photo = req.file.fileName;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateDetail, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getCurrentUser = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};