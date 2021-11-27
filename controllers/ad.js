const { validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const Room = require('../models/Room');

// @route   POST /ad
// @desc    Post a new ad
exports.addAd = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { productName, basePrice, duration, image, category } = req.body;
  const timer = duration === null ? 300 : duration;

  try {
    let ad = new Ad({
      productName,
      basePrice,
      currentPrice: basePrice,
      duration,
      timer,
      image,
      category,
      owner: req.user.id,
    });
    ad = await ad.save();

    // Create room for auction
    let room = new Room({ ad: ad._id });
    room = await room.save();

    res.status(200).json({ ad, room });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   GET /ad
// @desc    Retrieve list of all ads
exports.retrieveAds = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const adList = await Ad.find().sort({ createdAt: -1 });
    res.status(200).json(adList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   GET /ad/:id
// @desc    Find one ad
exports.findAd = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const adId = req.params.id; // id of type ObjectId (61a18153f926fdc2dd16d78b)
  try {
    const ad = await Ad.findById(adId);
    if (!ad) res.status(404).json({ errors: [{ msg: 'Ad not found' }] });
    res.status(200).json(ad);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

// @route   PUT /ad/:id
// @desc    Update an ad
exports.updateAd = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const adId = req.params.id;
  try {
    // Update all fields sent in body
    if (req.body.basePrice) {
      req.body.currentPrice = req.body.basePrice;
    }

    let updatedAd = await Ad.findByIdAndUpdate(adId, req.body);
    updatedAd = await Ad.findById(adId);

    res.status(200).json(updatedAd);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};