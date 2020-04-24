const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User Must Have A name'],
    trim: true,
    maxLength: [40, 'A User Must Have a name With Less Than 40 Characters'],
    minLength: [10, 'A User Must Have a name With At List 10 Characters']
  },
  email: {
    type: String,
    required: [true, 'A User Must Have A email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'A User Must Have Valid email'
    }
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  rote: {
    type: String,
    enum: {
      values: ['admin', 'guide', 'guide-lead', 'user'],
      message: 'A User Must Have rote Value Set To admin Or User.'
    },
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'A User Must Have A password'],
    minLength: 8,
    maxLength: 100,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordChanged = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    if (this.passwordChangedAt.getTime() / 1000 > JWTTimeStamp) {
      return true;
    }
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(64).toString('hex');
  this.passwordResetToken =
    crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  this.passwordResetExpires = Date.now() + 600000;
  return resetToken;
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
  }
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;