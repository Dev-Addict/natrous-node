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
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  console.log('we are creating a new Tour with details of' + this);
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log('a tour with ' + doc + 'created');
  next();
});

tourSchema.pre(/^find/g, function(next) {
  this.find({secretTour: {$ne: true}});
  next();
});

const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;