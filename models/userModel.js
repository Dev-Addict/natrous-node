const mongoose = require('mongoose');
const validator = require('validator');

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
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'A User Must Have Valid email'
    }
  },
  photo: {
    type: String,
    trim: true,
    validate: {
      validator: validator.isURL,
      message: 'A User Must Have A Valid photo URL'
    }
  },
  password: {
    type: String,
    required: [true, 'A User Must Have A password'],
    minLength: 8,
    maxLength: 100
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A User Must Have A password'],
    minLength: 8,
    maxLength: 100,
    validate: {
      validator: function(value) {
        return value === this.password;
      }
    }
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;