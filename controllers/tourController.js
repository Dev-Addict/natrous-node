const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  next();
};

exports.getTourStats = catchAsync(
  async (req, res) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res) => {
    const year = req.params.year * 1;
    const plan = Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          tourStartCount: { $sum: 1 },
          tours: { $push: '$_id' }
        }
      },
      {
        $addField: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { tourStartCount: -1 }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  }
);

exports.getNearTours = catchAsync(
  async (req, res, next) => {
    const {distance, latLan, unit} = req.params;
    const [lat, lan] = latLan.split(',').map(el => parseFloat(el));

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lan) {
      throw new AppError(
        'Please provide valid lat and lan with format of lat,lan.',
        400
      );
    }

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lan, lat], radius]
        }
      }
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  }
);

exports.getDistances = catchAsync(
  async (req, res, next) => {
    const { latLan: latLan, unit } = req.params;
    const [lat, lan] = latLan.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lan) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lan.',
          400
        )
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lan * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  }
);

exports.getTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, {path: 'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);