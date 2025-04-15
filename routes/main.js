const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donation = require('../models/Donation');

// Middleware for authentication
function isAuth(req, res, next) {
  if (req.session.userId) next();
  else res.redirect('/login');
}

// Home Route
router.get('/', (req, res) => res.redirect('/login'));

// Register Routes
router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch {
    res.send('User already exists');
  }
});

// Login Routes
router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/donate'); // Redirect to donation form
  } else {
    res.send('Invalid login credentials');
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Donation Form Route
router.get('/donate', isAuth, (req, res) => res.render('donate'));

// Donation Submission + Receipt Route
router.post('/donate', isAuth, async (req, res) => {
  const { bookName, quantity, expiryDate } = req.body;

  const donation = await Donation.create({
    donor: req.session.userId,
    bookName,
    quantity,
    expiryDate: new Date(expiryDate),
    donationDate: new Date()
  });

  const user = await User.findById(req.session.userId);

  res.render('receipt', {
    donation: {
      ...donation.toObject(),
      expiryDate: new Date(donation.expiryDate),
      donationDate: new Date(donation.donationDate)
    },
    donorName: user ? user.name : 'Anonymous'
  });
});

// Dashboard Route
router.get('/dashboard', isAuth, async (req, res) => {
  const donations = await Donation.find({ donor: req.session.userId });
  res.render('dashboard', { donations });
});

module.exports = router;
