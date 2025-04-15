const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookName: String,
  quantity: Number,
  expiryDate: String,
  donationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);
