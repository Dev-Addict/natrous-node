const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimeType.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'invalid file input we only accept images.',
        400
      ),
      false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const ext = file.mimeType.split('/')[1];
  req.file.filename = `user-${req.user.id}-${Date.now()}.${ext}`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

exports.uploadUserPhoto = upload.single('photo');

exports.getUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);