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
    validate: {
      validator: validator.isURL,
      message: 'A User Must Have A Valid photo URL'
    }
  },
  password: {
    type: String,
    required: [true, 'A User Must Have A password'],
    minLength: 8,
    maxLength: 100,
    select: false
  }
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;