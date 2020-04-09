const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Tour Must Have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A Tour Must Have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A Tour Must Have a maxGroupSize']
  },
  difficulty: {
    type: String,
    required: [true, 'A Tour Must Have a difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 0
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A Tour Must Have a price']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A Tour Must Have a description']
  },
  imageCover: {
    type: String,
    required: [true, 'A Tour Must Have a imageCover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;